Setting up a new Nidget project
===============================

npm init
npm i @nidget/core
npm i babelify
npm i @babel/preset-env
npx nidget init
npx nidget create -n nidget-name
npx nidget view -n index
npx nidget render

npx babel client/lib.js --out-file dist/lib.js


Nidget Record
=============

- name: the normalized name of the nidget, view, or include
- script: location of the .js file (dist or output) might be babelified
- view: location of the .ejs file, not processed until the pack step
- style: location of the .scss file, processed during render step
- type: {view, nidget, include}
  - view: results in a browser target
  - nidget: included as an html element in a view or other nidget
  - include: .scss or .js include file, does not get processed
- package: package name
- includes: nidgets that this view/nidget has in it's .ejs file
- parent: views/nidget that has this in it's .ejs file

Includes and parent fields are used to determine which files get added during the .ejs render 
and .js browserify processes.  If the file is already included in the .js file, it is not required
to be included here, browserify will handle it.
  
