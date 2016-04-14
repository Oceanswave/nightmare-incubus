GREP ?=.

test: node_modules
	@rm -rf /tmp/nightmare-incubus
	@node_modules/.bin/mocha --harmony --grep "$(GREP)"

node_modules: package.json
	@npm install

.PHONY: test