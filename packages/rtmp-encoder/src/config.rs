use crate::config_utils::from_str;
use serde::Deserialize;

#[derive(Deserialize)]
pub(crate) struct VideoSettings {
    #[serde(rename = "video_width", deserialize_with = "from_str")]
    pub(crate) width: u32,
    #[serde(rename = "video_height", deserialize_with = "from_str")]
    pub(crate) height: u32,
    #[serde(rename = "video_bitrate", deserialize_with = "from_str")]
    pub(crate) bitrate: u32,
    #[serde(rename = "video_framerate", deserialize_with = "from_str")]
    pub(crate) framerate: u32,
    #[serde(rename = "video_profile")]
    pub(crate) profile: Option<String>,
    #[serde(rename = "video_level")]
    pub(crate) level: Option<String>,
}

#[derive(Deserialize)]
pub(crate) struct AudioSettings {
    #[serde(rename = "audio_bitrate", deserialize_with = "from_str")]
    pub(crate) bitrate: u32,
    #[serde(rename = "audio_channels", deserialize_with = "from_str")]
    pub(crate) channels: u32,
    #[serde(rename = "audio_sample_rate", deserialize_with = "from_str")]
    pub(crate) sample_rate: u32,
}

#[derive(Deserialize)]
pub(crate) enum VideoAcceleration {
    VAAPI,
    V4L2,
}

#[derive(Deserialize)]
pub(crate) struct Config {
    #[serde(deserialize_with = "from_str")]
    pub(crate) user_id: u32,
    #[serde(deserialize_with = "from_str")]
    pub(crate) channel_id: u32,
    pub(crate) playback_server_url: String,

    // RTMP settings
    pub(crate) rtmp_url: String,
    pub(crate) rtmp_stream_key: String,

    // Encoding parameters
    #[serde(flatten)]
    pub(crate) audio: AudioSettings,
    #[serde(flatten)]
    pub(crate) video: VideoSettings,
    pub(crate) video_acceleration: Option<VideoAcceleration>,
}

impl Config {
    pub(crate) fn from_env() -> Self {
        envy::from_env().expect("Unable to parse environment variables")
    }
}
