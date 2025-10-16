FROM ubuntu:22.04 AS gst-plugins

ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      cmake \
      build-essential \
      ca-certificates \
      git \
      pkg-config \
      libssl-dev \
      libglib2.0-dev \
      gstreamer1.0 \
      libgstreamer-plugins-base1.0-dev \
      libgstreamer-plugins-bad1.0-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Rust and Cargo
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /src

# Build gstcefsrc plugin
RUN git clone https://github.com/centricular/gstcefsrc.git && \
    cd gstcefsrc && \
    mkdir build && cd build && \
    cmake -G "Unix Makefiles" -DCMAKE_BUILD_TYPE=Release .. && \
    make

# Check whether gstcefsrc plugin was successfully installed
RUN LD_PRELOAD="gstcefsrc/build/Release/libcef.so" \
    GST_PLUGIN_PATH="gstcefsrc/build/Release:$GST_PLUGIN_PATH" \
    gst-inspect-1.0 cefsrc


FROM ubuntu:22.04 AS gst

ENV DEBIAN_FRONTEND=noninteractive

# Install GStreamer and dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      gstreamer1.0-plugins-base \
      gstreamer1.0-plugins-good \
      gstreamer1.0-plugins-bad \
      gstreamer1.0-plugins-ugly \
      gstreamer1.0-libav \
      gstreamer1.0-vaapi \
      gstreamer1.0 \
      ca-certificates \
      openssl \
    && apt-get install -y --no-install-recommends i965-va-driver || echo "i965-va-driver not available" \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


FROM gst AS devenv

ARG USER=1000:1000

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      build-essential \
      curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Home-like directory for the unprivileged user’s Rust toolchain
RUN mkdir -p /rust && chown -R ${USER} /rust
USER ${USER}

# Make cargo/rustup live under /rust and be on PATH for subsequent layers
ENV HOME=/rust \
    RUSTUP_HOME=/rust/rustup \
    CARGO_HOME=/rust/.cargo \
    PATH=/rust/.cargo/bin:$PATH

# Install rustup + stable toolchain (minimal profile), then common components
RUN set -eux; \
    curl --proto '=https' --tlsv1.2 -fsS https://sh.rustup.rs \
      | sh -s -- -y --default-toolchain stable --profile minimal; \
    rustup component add rustfmt clippy; \
    rustc -V && cargo -V && rustup -V

WORKDIR /code/


FROM gst AS devenv-cef

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      xvfb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled GStreamer plugins
COPY --from=gst-plugins /src/gstcefsrc/build/* /opt/gstcefsrc/
ENV LD_PRELOAD="/opt/gstcefsrc/libcef.so"
ENV GST_PLUGIN_PATH="/opt/gstcefsrc:$GST_PLUGIN_PATH"

WORKDIR /code/


FROM gst AS build

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      curl \
      build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /code/

COPY packages/rtmp-encoder/Cargo.toml ./
COPY packages/rtmp-encoder/Cargo.lock ./
COPY packages/rtmp-encoder/src ./src

RUN cargo build --release


FROM gst AS with-cef

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      xvfb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /code/target/release/radioterio-rtmp-encoder /radioterio-rtmp-encoder
COPY packages/rtmp-encoder/entrypoint-cef.sh /entrypoint-cef.sh

# Copy compiled GStreamer plugins
COPY --from=gst-plugins /src/gstcefsrc/build/* /opt/gstcefsrc/
ENV LD_PRELOAD="/opt/gstcefsrc/libcef.so"
ENV GST_PLUGIN_PATH="/opt/gstcefsrc:$GST_PLUGIN_PATH"

ENTRYPOINT ["/entrypoint-cef.sh"]


FROM gst

COPY --from=build /code/target/release/radioterio-rtmp-encoder /radioterio-rtmp-encoder
COPY packages/rtmp-encoder/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
