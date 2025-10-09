api-server:
	docker build --progress=plain -t radioterio-api-server -f packages/api-server/Dockerfile .

playback-server:
	docker build --progress=plain -t radioterio-playback-server -f packages/playback-server/Dockerfile .
