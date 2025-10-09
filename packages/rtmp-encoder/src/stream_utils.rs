use crate::gstreamer_utils::{make_capsfilter, make_element};
use gstreamer::prelude::*;

pub(crate) fn make_audio_input(pipeline: &gstreamer::Pipeline, url: &str) -> gstreamer::Element {
    let souphttpsrc = make_element("souphttpsrc");
    souphttpsrc.set_property("location", url);
    let mpegaudioparse = make_element("mpegaudioparse");
    let mpg123audiodec = make_element("mpg123audiodec");

    pipeline
        .add_many(&[&souphttpsrc, &mpegaudioparse, &mpg123audiodec])
        .expect("Failed to add audio input elements to pipeline");

    gstreamer::Element::link_many(&[&souphttpsrc, &mpegaudioparse, &mpg123audiodec])
        .expect("Failed to link audio input elements");

    mpg123audiodec
}

pub(crate) enum StreamOutput {
    RTMP { url: String, stream_key: String },
}

pub(crate) fn make_output(
    pipeline: &gstreamer::Pipeline,
    stream_output: &StreamOutput,
) -> (gstreamer::Pad, gstreamer::Pad) {
    match stream_output {
        StreamOutput::RTMP { url, stream_key } => {
            let flvmux = make_element("flvmux");
            flvmux.set_property("streamable", &true);
            flvmux.set_property("latency", &1_000_000_000_u64);

            let rtmp2sink = make_element("rtmp2sink");
            rtmp2sink.set_property("location", format!("{}/{}", url, stream_key));

            pipeline
                .add_many(&[&flvmux, &rtmp2sink])
                .expect("Unable to add flvmux or rtmp2sink to pipeline");

            flvmux
                .link(&rtmp2sink)
                .expect("Unable to link flvmux to rtmp2sink");

            let flv_video_sink = flvmux
                .request_pad_simple("video")
                .expect("Unable to get flv video");
            let flv_audio_sink = flvmux
                .request_pad_simple("audio")
                .expect("Unable to get flv video");

            (flv_video_sink, flv_audio_sink)
        }
    }
}

pub(crate) enum VideoEncoder {
    Software,
    VA,
}

pub(crate) fn make_video_encoder(
    pipeline: &gstreamer::Pipeline,
    video_width: u32,
    video_height: u32,
    video_bitrate: u32,
    video_framerate: u32,
    video_profile: &Option<String>,
    video_encoder: &VideoEncoder,
) -> (gstreamer::Element, gstreamer::Element) {
    let queue_in = make_element("queue");
    let videoconvert = make_element("videoconvert");
    let caps_in = make_capsfilter(
        &gstreamer::Caps::builder("video/x-raw")
            .field("width", video_width as i32)
            .field("height", video_height as i32)
            .field("rate", gstreamer::Fraction::from(video_framerate as i32))
            .field("format", &"NV12")
            .build(),
    );

    let encoder = match video_encoder {
        VideoEncoder::Software => {
            let x264enc = make_element("x264enc");
            x264enc.set_property("key-int-max", video_framerate * 2);
            x264enc.set_property("bitrate", video_bitrate);
            x264enc.set_property_from_str("pass", "cbr");
            x264enc
        }
        VideoEncoder::VA => {
            let vaapih264enc = make_element("vaapih264enc");
            vaapih264enc.set_property("keyframe-period", video_framerate * 2);
            vaapih264enc.set_property("bitrate", video_bitrate);
            vaapih264enc.set_property_from_str("rate-control", "cbr");
            vaapih264enc
        }
    };

    let h264parse = make_element("h264parse");
    let caps_after_encoder = {
        let mut caps_builder = gstreamer::Caps::builder("video/x-h264");
        if let Some(profile) = video_profile {
            caps_builder = caps_builder.field("profile", profile)
        }
        make_capsfilter(&caps_builder.build())
    };
    let queue_out = make_element("queue");

    pipeline
        .add_many(&[
            &queue_in,
            &videoconvert,
            &caps_in,
            &encoder,
            &h264parse,
            &caps_after_encoder,
            &queue_out,
        ])
        .expect("Unable to add elements to pipeline");

    gstreamer::Element::link_many(&[
        &queue_in,
        &videoconvert,
        &caps_in,
        &encoder,
        &h264parse,
        &caps_after_encoder,
        &queue_out,
    ])
    .expect("Unable to link elements");

    (queue_in, queue_out)
}

pub(crate) fn make_audio_encoder(
    pipeline: &gstreamer::Pipeline,
    bitrate: u32,
    channels: u32,
    sample_rate: u32,
) -> (gstreamer::Element, gstreamer::Element) {
    let queue_in = make_element("queue");
    let audioconvert = make_element("audioconvert");
    let fdkaacenc = make_element("fdkaacenc");
    fdkaacenc.set_property("peak-bitrate", (bitrate * 1000) as i32);
    let aacparse = make_element("aacparse");
    let caps = make_capsfilter(
        &gstreamer::Caps::builder("audio/mpeg")
            .field("rate", sample_rate as i32)
            .field("channels", channels as i32)
            .build(),
    );
    let queue_out = make_element("queue");

    pipeline
        .add_many(&[
            &queue_in,
            &audioconvert,
            &fdkaacenc,
            &aacparse,
            &caps,
            &queue_out,
        ])
        .expect("Unable to add elements to pipeline");

    gstreamer::Element::link_many(&[
        &queue_in,
        &audioconvert,
        &fdkaacenc,
        &aacparse,
        &caps,
        &queue_out,
    ])
    .expect("Unable to link elements");

    (queue_in, queue_out)
}
