sudo: false
language: node_js
node_js:
  - "0.10"
  - "0.12"
  - "4.1"
  - "5"

before_install:
  - travis_retry npm install npm -g

before_install:
  - travis_retry npm install -g npm@2.5.1
  - travis_retry npm install

script:
  - npm test

after_script:
  - npm run cover
  - npm run coveralls

matrix:
  allow_failures:
    - node_js: "0.10"

notifications:
  email:
    - travis@nodejitsu.com
  irc: "irc.freenode.org#nodejitsu"
