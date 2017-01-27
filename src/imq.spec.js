import {expect} from 'chai';
import imq from './imq';

describe('imq binding library', function () {

    describe('.getVersion()', function () {

        it('should return a version in the format x.x.x', function () {
            var version = imq.getVersion();
            expect(version).to.be.a('string');
            expect(version).to.match(/^\d+\.\d+\.\d+$/);
        });

    });

    describe('.QValue', function () {
        let QValue = imq.QValue;

        describe('#getTypeString()', function () {
            it('should return a string representation of imq.type', function () {
                expect(QValue.getTypeString(imq.type.Nil)).to.equal('Nil');
                expect(QValue.getTypeString(imq.type.Bool)).to.equal('Bool');
                expect(QValue.getTypeString(imq.type.Integer)).to.equal('Integer');
                expect(QValue.getTypeString(imq.type.Float)).to.equal('Float');
                expect(QValue.getTypeString(imq.type.String)).to.equal('String');
                expect(QValue.getTypeString(imq.type.Function)).to.equal('Function');
                expect(QValue.getTypeString(imq.type.Object)).to.equal('Object');
            });

            it('should return <???> on an unknown type', function () {
                expect(QValue.getTypeString(-10)).to.equal('<???>');
            });
        });

        describe('#Nil()', function () {
            var val = QValue.Nil();

            it('should create a nil value', function () {
                expect(val).to.be.a('object');
                expect(val.getType()).to.equal(imq.type.Nil);
            });

        });

        describe('#Bool()', function () {
            var vTrue = QValue.Bool(true);
            var vFalse = QValue.Bool(false);

            it('should create a boolean value', function () {
                expect(vTrue).to.be.a('object');
                expect(vFalse).to.be.a('object');
                expect(vTrue.getType()).to.equal(imq.type.Bool);
                expect(vFalse.getType()).to.equal(imq.type.Bool);
            });
        });

        describe('#Integer()', function () {
            var val = QValue.Integer(-138);

            it('should create an integer value', function () {
                expect(val).to.be.a('object');
                expect(val.getType()).to.equal(imq.type.Integer);
            });
        });

        describe('#Float()', function () {
            var val = QValue.Float(45.67);

            it('should create a float value', function () {
                expect(val).to.be.a('object');
                expect(val.getType()).to.equal(imq.type.Float);
            });
        });

        describe('#String()', function () {
            var val = QValue.String('foo bar');
            
            it('should create a string value', function () {
                expect(val).to.be.a('object');
                expect(val.getType()).to.equal(imq.type.String);
            });
        });

        describe('.asString()', function () {
            it('should return an empty string for nil', function () {
                expect(QValue.Nil().asString()).to.equal('');
            });

            it('should return booleans', function () {
                expect(QValue.Bool(true).asString()).to.equal('true');
                expect(QValue.Bool(false).asString()).to.equal('false');
            });

            it('should return integers', function () {
                expect(QValue.Integer(123).asString()).to.equal('123');
                expect(QValue.Integer(-456).asString()).to.equal('-456');
            });

            it('should return floats', function () {
                expect(QValue.Float(123.45).asString()).to.equal('123.45');
                expect(QValue.Float(-837.21).asString()).to.equal('-837.21');
            });

            it('should return strings', function () {
                expect(QValue.String('foo bar').asString()).to.equal('"foo bar"');
            });
        });

        describe('.getBool()', function () {
            it('should return booleans on boolean types', function () {
                expect(QValue.Bool(true).getBool()).to.equal(true);
                expect(QValue.Bool(false).getBool()).to.equal(false);
            });

            it('should return null on non-boolean types', function () {
                expect(QValue.Integer(123).getBool()).to.be.null;
                expect(QValue.Float(123.45).getBool()).to.be.null;
                expect(QValue.String('foo bar').getBool()).to.be.null;
            });
        });

        describe('.getInteger()', function () {
            it('should return integers on integer types', function () {
                expect(QValue.Integer(123).getInteger()).to.equal(123);
                expect(QValue.Integer(-567).getInteger()).to.equal(-567);
            });

            it ('should return null on non-integer types', function () {
                expect(QValue.Bool(true).getInteger()).to.be.null;
                expect(QValue.Float(123.45).getInteger()).to.be.null;
                expect(QValue.String('foo bar').getInteger()).to.be.null;
            });
        });

        describe('.getFloat()', function () {
            it('should return floats on float types', function () {
                expect(QValue.Float(123.45).getFloat()).to.be.closeTo(123.45, 0.001);
                expect(QValue.Float(-84.23).getFloat()).to.be.closeTo(-84.23, 0.001);
            });

            it('should return null on non-float types', function () {
                expect(QValue.Bool(true).getFloat()).to.be.null;
                expect(QValue.Integer(123).getFloat()).to.be.null;
                expect(QValue.String('foo bar').getFloat()).to.be.null;
            });
        });

        describe('.getNumber()', function () {
            it('should return numbers on numeric types', function () {
                expect(QValue.Integer(123).getNumber()).to.equal(123);
                expect(QValue.Float(-45.76).getNumber()).to.be.closeTo(-45.76, 0.001);
            });

            it('should return null on non-numeric types', function () {
                expect(QValue.Bool(true).getNumber()).to.be.null;
                expect(QValue.String('foo bar').getNumber()).to.be.null;
            });
        });

        describe('.getString()', function () {
            it('should return strings on string types', function () {
                expect(QValue.String('foo bar').getString()).to.equal('foo bar');
            });

            it('should return null on non-string types', function () {
                expect(QValue.Bool(true).getString()).to.be.null;
                expect(QValue.Integer(123).getString()).to.be.null;
                expect(QValue.Float(95.8).getString()).to.be.null;
            });
        });

        describe('.toBool()', function () {
            it('should return boolean values on convertable types', function () {
                expect(QValue.Bool(true).toBool().getBool()).to.equal(true);
                expect(QValue.Bool(false).toBool().getBool()).to.equal(false);

                expect(QValue.Integer(1).toBool().getBool()).to.equal(true);
                expect(QValue.Integer(0).toBool().getBool()).to.equal(false);
                expect(QValue.Integer(-15).toBool().getBool()).to.equal(true);

                expect(QValue.Float(10.4).toBool().getBool()).to.equal(true);
                expect(QValue.Float(-4.32).toBool().getBool()).to.equal(true);
                expect(QValue.Float(0).toBool().getBool()).to.equal(false);
                expect(QValue.Float(0.00001).toBool().getBool()).to.equal(true);

                expect(QValue.String("true").toBool().getBool()).to.equal(true);
                expect(QValue.String("false").toBool().getBool()).to.equal(false);
            });

            it('should return null on unconvertable types', function () {
                expect(QValue.String("TRUE").toBool()).to.be.null;
                expect(QValue.String("FALSE").toBool()).to.be.null;
                expect(QValue.String("foo BaR true false").toBool()).to.be.null;
            });
        });

        describe('.toInteger()', function () {
            it('should return integer values on convertable types', function () {
                expect(QValue.Bool(true).toInteger().getInteger()).to.equal(1);
                expect(QValue.Bool(false).toInteger().getInteger()).to.equal(0);

                expect(QValue.Integer(123).toInteger().getInteger()).to.equal(123);

                expect(QValue.Float(10.459).toInteger().getInteger()).to.equal(10);
                expect(QValue.Float(15.97).toInteger().getInteger()).to.equal(15);
                expect(QValue.Float(-10.98).toInteger().getInteger()).to.equal(-10);
                expect(QValue.Float(-13.0384).toInteger().getInteger()).to.equal(-13);

                expect(QValue.String('123').toInteger().getInteger()).to.equal(123);
                expect(QValue.String('-8839').toInteger().getInteger()).to.equal(-8839);
            });

            it('should return null values on unconvertable types', function () {
                expect(QValue.String('foo bAr 129').toInteger()).to.be.null;
                expect(QValue.String('99.58').toInteger()).to.be.null;
            });
        });

        describe('.toFloat()', function () {
            it('should return float values on convertable types', function () {
                expect(QValue.Bool(true).toFloat().getFloat()).to.equal(1);
                expect(QValue.Bool(false).toFloat().getFloat()).to.equal(0);

                expect(QValue.Integer(123).toFloat().getFloat()).to.equal(123);
                expect(QValue.Integer(-449).toFloat().getFloat()).to.equal(-449);

                expect(QValue.Float(99.45).toFloat().getFloat()).to.be.closeTo(99.45, 0.0001);
                expect(QValue.Float(-894.1).toFloat().getFloat()).to.be.closeTo(-894.1, 0.0001);

                expect(QValue.String('190').toFloat().getFloat()).to.equal(190);
                expect(QValue.String('-93.219').toFloat().getFloat()).to.be.closeTo(-93.219, 0.0001);
            });

            it('should return null values on unconvertable types', function () {
                expect(QValue.String('193.58 foo bar').toFloat()).to.be.null;
                expect(QValue.String('bar baz 91930hc').toFloat()).to.be.null;
            });
        });

        describe('.toString()', function () {
            it('should return string values on convertable types', function () {
                expect(QValue.Nil().toString().getString()).to.equal('');

                expect(QValue.Bool(true).toString().getString()).to.equal('true');
                expect(QValue.Bool(false).toString().getString()).to.equal('false');

                expect(QValue.Integer(123).toString().getString()).to.equal('123');
                expect(QValue.Integer(-449).toString().getString()).to.equal('-449');

                expect(QValue.Float(19.4).toString().getString()).to.equal('19.4');
                expect(QValue.Float(-9.3).toString().getString()).to.equal('-9.3');

                expect(QValue.String('hello world').toString().getString()).to.equal('hello world');
            });
        });

    });

});