api-server:
	docker build --progress=plain -t radioterio-api-server -f packages/api-server/Dockerfile .

playback-server:
	docker build --progress=plain -t radioterio-playback-server -f packages/playback-server/Dockerfile .

rtmp-encoder:
	docker build --progress=plain -t radioterio-rtmp-encoder -f packages/rtmp-encoder/Dockerfile .

rtmp-encoder-cef:
	docker build --progress=plain -t radioterio-rtmp-encoder-cef -f packages/rtmp-encoder/Dockerfile --target with-cef .
