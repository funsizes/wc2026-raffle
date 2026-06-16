# Requires `npm run sync:shared` before `sam build` (copies shared → lambda/_shared).
# SAM's build sandbox has no node_modules — install deps in the artifact, bundle, then ship js only.
build-FetchMatchesFunction:
	rm -rf $(ARTIFACTS_DIR)
	mkdir -p $(ARTIFACTS_DIR)/node_modules/@wc2026
	cp -r _shared $(ARTIFACTS_DIR)/node_modules/@wc2026/shared
	cp fetch-matches.ts football-api-key.ts package.json $(ARTIFACTS_DIR)/
	cd $(ARTIFACTS_DIR) && npm install --omit=dev
	cd $(ARTIFACTS_DIR) && npx esbuild fetch-matches.ts --bundle --platform=node --target=node22 --format=cjs --outfile=fetch-matches.js --sourcemap
	rm -rf $(ARTIFACTS_DIR)/node_modules $(ARTIFACTS_DIR)/*.ts $(ARTIFACTS_DIR)/package.json $(ARTIFACTS_DIR)/package-lock.json
