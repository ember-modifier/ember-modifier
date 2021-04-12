import Application from 'dummy/app';
import config from 'dummy/config/environment';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';
import QUnit from 'qunit';
import { resetOnerror } from '@ember/test-helpers';

// install types for qunit-dom
import 'qunit-dom';

QUnit.testDone(function () {
  resetOnerror();
});

setApplication(Application.create(config.APP));

start();
