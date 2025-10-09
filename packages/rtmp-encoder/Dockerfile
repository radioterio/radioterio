FROM ubuntu:22.04 AS gst-plugins

ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies
RUN apt-get update && \
    apt-get install -y \
      cmake \
      git \
      pkg-config \
      curl \
      build-essential \
      libssl-dev \
      libglib2.0-dev \
      gstreamer1.0 \
      libgstreamer-plugins-base1.0-dev \
      libgstreamer-plugins-bad1.0-dev

# Install Rust and Cargo
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /src

FROM ubuntu:22.04 AS build-deps


ENV DEBIAN_FRONTEND=noninteractive

# Install GStreamer and dependencies
RUN apt-get update && \
    apt-get install -y \
    curl \
    xvfb \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    gstreamer1.0 \
    libgirepository1.0-dev


FROM build-deps AS build

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

WORKDIR /code/

COPY packages/rtmp-encoder/Cargo.toml ./
COPY packages/rtmp-encoder/Cargo.lock ./
COPY packages/rtmp-encoder/src ./src

RUN cargo build --release

FROM build-deps

COPY --from=build /code/target/release/radioterio-rtmp-encoder /radioterio-rtmp-encoder
COPY packages/rtmp-encoder/entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
