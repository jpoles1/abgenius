PACKAGE_VERSION = $(shell node -pe "require('./package.json').version")

run:
	npm run serve
build:
	npm run build
deploy:
	make build && git add -A && git commit -e -m "Release $(PACKAGE_VERSION)" && git checkout master && git merge dev && git push --all && git checkout dev
test:
	npm run test:watch