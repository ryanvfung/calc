QUnit.test('Adding 2 numbers', function(assert) {
	assert.ok(processInput('11+12').equal(23));
});
QUnit.test('Adding 9 numbers', function(assert) {
	assert.ok(processInput('1+2+3+4+5+6+7+8+9').equal(45));
});
QUnit.test('Subtracting 2 numbers', function(assert) {
	assert.ok(processInput('13-14').equal(-1));
});
QUnit.test('Subtracting 9 numbers', function(assert) {
	assert.ok(processInput('81-9-9-9-9-9-9-9-9-9').equal(0));
});
QUnit.test('Multiplying 2 numbers', function(assert) {
	assert.ok(processInput('11*9').equal(99));
});
QUnit.test('Multiplying 9 numbers', function(assert) {
	assert.ok(processInput('1*2*3*4*5*6*7*8*9').equal(362880));
});
QUnit.test('Dividing 2 numbers', function(assert) {
	assert.ok(processInput('99/11').equal(9));
});
QUnit.test('Dividing 9 numbers', function(assert) {
	assert.ok(processInput('3628800/9/8/7/6/5/4/3/2/1').equal(10));
});
QUnit.test('Power of 2 numbers', function(assert) {
	assert.ok(processInput('2^10').equal(1024));
});