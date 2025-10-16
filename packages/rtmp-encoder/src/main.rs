use crate::config::{Config, VideoAcceleration};
use crate::gstreamer_utils::make_element;
use crate::stream_utils::{
    StreamOutput, VideoEncoder, make_audio_encoder, make_audio_input, make_output,
    make_video_encoder, make_video_input,
};
use gstreamer::prelude::*;

mod config;
mod config_utils;
mod gstreamer_utils;
mod stream_utils;

pub(crate) fn main() {
    let config = Config::from_env();

    gstreamer::init().expect("Unable to initialize GStreamer!");

    let pipeline = gstreamer::Pipeline::new(None);

    let video_encoder = match config.video_acceleration {
        None => VideoEncoder::Software,
        Some(VideoAcceleration::VAAPI) => VideoEncoder::VA,
        Some(VideoAcceleration::V4L2) => VideoEncoder::V4L2,
    };
    let (video_sink, video_src) = make_video_encoder(
        &pipeline,
        config.video.width,
        config.video.height,
        config.video.bitrate,
        config.video.framerate,
        &config.video.profile,
        &config.video.level,
        &video_encoder,
    );
    let (audio_sink, audio_src) = make_audio_encoder(
        &pipeline,
        config.audio.bitrate,
        config.audio.channels,
        config.audio.sample_rate,
    );
    let output = StreamOutput::RTMP {
        url: config.rtmp_url,
        stream_key: config.rtmp_stream_key,
    };
    let (output_video_sink_pad, output_audio_sink_pad) = make_output(&pipeline, &output);

    let html = include_str!("index.html").as_bytes();
    let video_url = format!(
        "data:text/html;base64,{}",
        gstreamer::glib::base64_encode(html)
    );
    let videoinput_src = make_video_input(&pipeline, &video_url);

    let audio_url = format!(
        "{}/user/{}/channel/{}/stream",
        config.playback_server_url, config.user_id, config.channel_id
    );
    let audioinput_src = make_audio_input(&pipeline, &audio_url);

    let audiomixer = make_element("audiomixer");
    let clockoverlay = make_element("clockoverlay");

    pipeline
        .add_many(&[&audiomixer, &clockoverlay])
        .expect("Unable to add elements");

    gstreamer::Element::link_many(&[&videoinput_src, &clockoverlay, &video_sink])
        .expect("Unable to link elements");
    gstreamer::Element::link_many(&[&audioinput_src, &audiomixer, &audio_sink])
        .expect("Unable to link elements");

    video_src
        .static_pad("src")
        .expect("Unable to get video pad")
        .link(&output_video_sink_pad)
        .expect("Unable to link pads");
    audio_src
        .static_pad("src")
        .expect("Unable to get audio pad")
        .link(&output_audio_sink_pad)
        .expect("Unable to link pads");

    pipeline
        .set_state(gstreamer::State::Playing)
        .expect("Unable to start pipeline");

    let bus = pipeline.bus().expect("Unable to get bus");

    for msg in bus.iter_timed(gstreamer::ClockTime::NONE) {
        use gstreamer::MessageView;

        match msg.view() {
            MessageView::Eos(..) => {
                println!("End of stream");
                break;
            }
            MessageView::Error(err) => {
                eprintln!(
                    "Error from {:?}: {} ({:?})",
                    err.src().map(|s| s.path_string()),
                    err.error(),
                    err.debug()
                );
                break;
            }
            _ => (),
        }
    }

    // Cleanup
    pipeline
        .set_state(gstreamer::State::Null)
        .expect("Unable to set pipeline to null");
}
