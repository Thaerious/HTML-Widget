# npx c8 bash mock/test.sh

rm mock/client-src -rf
rm mock/.nidgetrc -rf
node src/cli --cwd mock init create component a-nidget create view index clean build show-settings records help
npx c8 --all true report -r html