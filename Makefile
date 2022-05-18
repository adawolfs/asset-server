# Build container
IMAGE := registry.gitlab.com/adawolfs/guategeeks-ar-api

build-container:
	docker build -t $(IMAGE) .

push-container:
	docker push $(IMAGE)