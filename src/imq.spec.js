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

    });

});