describe('Formatting numbers',function() {
    beforeEach(module('cur.$mask'));

    var $compile, $rootScope, $filter, $timeout;

    beforeEach(inject(function(_$compile_, _$rootScope_, _$filter_, _$timeout_){
        // The injector unwraps the underscores (_) from around the parameter names when matching
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $filter = _$filter_;
        $timeout = _$timeout_;
    }));

    describe('Testing directive', function() {

        it('typing 1 with standard config and hard-coded $ should return $0.01',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('1').triggerHandler('input');
            expect(element.val()).toEqual('$0.01');
        })

        it('typing negative number with standard config and hard-coded $ should return -$12',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('-12').triggerHandler('input');
            expect(element.val()).toEqual('-$12');
        })

        it('typing negative number with standard config and hard-coded $ should return -$ when user write only - character',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('-').triggerHandler('input');
            expect(element.val()).toEqual('-$');
        })

        it('typing a minus character in the middle of a number with standard config and hard-coded $ should be ignored',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('12-4').triggerHandler('input');
            expect(element.val()).toEqual('$1.24');
        })


        it ('typing 123456 with standard config without setting currency should return $1,234.56',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency />")($rootScope);
            $rootScope.$digest();
            element.val('123456').triggerHandler('input');
            expect(element.val()).toEqual('$1,234.56');
        })

        it ('typing 123456 with standard config and empty currency should return 1,234.56',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"''\" />")($rootScope);
            $rootScope.$digest();
            element.val('123456').triggerHandler('input');
            expect(element.val()).toEqual('1,234.56');
        })

        it('typing 1 and erase it with indentation and hard-coded $ should return $ 0.00', function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'$'\" config=\"{indentation:' '}\" />")($rootScope);
            $rootScope.$digest();
            element.val('1').triggerHandler('input');
            element.val(element.val().slice(0, -1)).triggerHandler('input');
            expect(element.val()).toEqual('$ 0.00');
        })

        it('typing 1 and erase it twice with indentation and hard-coded $ should return empty', function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'$'\" config=\"{indentation:' '}\" />")($rootScope);
            $rootScope.$digest();
            element.val('1').triggerHandler('input');
            var empty = element.val().slice(0, -1);
            element.val(empty).triggerHandler('input');
            element.val(empty).triggerHandler('input');
            expect(element.val()).toEqual('');
        })

        it('typing 1 with 8 zeros using BRL config should return 1.000.000,00', function() {
            var configStr = "{indentation: ' ', group:'.' ,decimal:','}"
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'R$'\" config=\""+configStr+"\" />")($rootScope);
            $rootScope.$digest();
            element.val('100000000').triggerHandler('input');
            expect(element.val()).toEqual('R$ 1.000.000,00');
        })

        it('typing random number using BRL config and then update ng-model to 100 should return R$ 100,00', function() {
            var configStr = "{indentation: ' ', group:'.' ,decimal:','}"
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'R$'\" config=\""+configStr+"\" />")($rootScope);
            $rootScope.$digest();
            element.val('100000000').triggerHandler('input');
            $rootScope.currency = 100;
            $rootScope.$digest();

            expect(element.val()).toBe('R$ 100,00')
        })

        it('setting up 12.34 on scope with custom config should return 12.34 p.', function() {
            $rootScope.currency = 12.34;
            var configStr = "{orientation:'r',indentation:' '}"
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'p.'\" config=\""+configStr+"\" />")($rootScope);
            $rootScope.$digest();
            expect(element.val()).toBe('12.34 p.')
        })

        it('changing the config does not give the focus to the input', function() {
            $rootScope.currency = 12.34;
            var configStr = "{orientation:'r',indentation:' '}"
            var element = $compile("<input type=\"text\" ng-model=\"currency\" mask-currency=\"'p.'\" config=\""+configStr+"\" />")($rootScope);
            spyOn(element[0], 'focus');
            $rootScope.$digest();
            configStr.orientation = 'l';
            $rootScope.$digest();
            $timeout.flush();
            expect(element[0].focus).not.toHaveBeenCalled();
        })

        it('changing the input value should save the model value as a number',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" min=\"0\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('-1.02').triggerHandler('input');
            expect($rootScope.currency).toBe(-1.02);
            expect(typeof $rootScope.currency === 'number').toBeTrue();
        })

        it('changing the input value should trigger the min validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" min=\"0\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('-1.00').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(false);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(true);
            element.val('2.00').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
            element.val('').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
        })

        it('changing the input value without min should not trigger the min validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" min=\"\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('-1.00').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
            element.val('').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
        })

        it('empty the input value after invalid min should reset the min validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" min=\"2\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('1.00').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(true);
            element.val('').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
        })

        it('changing the model value should trigger the min validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"modelValue\" min=\"0\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            $rootScope.modelValue = -1.00;
            $rootScope.$digest();
            expect(element.hasClass('ng-valid')).toEqual(false);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(true);
            $rootScope.modelValue = 2.00;
            $rootScope.$apply();
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
            $rootScope.modelValue = undefined;
            $rootScope.$apply();
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
        })

        it('changing the model value without min should not trigger the min validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"modelValue\" min=\"\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            $rootScope.modelValue = -1.00;
            $rootScope.$digest();
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
            $rootScope.modelValue = undefined;
            $rootScope.$digest();
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
        })

        it('changing the model value with invalid value should not trigger the min validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"modelValue\" min=\"0\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            $rootScope.modelValue = 'None parsable value';
            $rootScope.$digest();
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
        })

        it('changing the input value should trigger the max validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" max=\"100\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('200.00').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(false);
            expect(element.hasClass('ng-invalid-max')).toEqual(true);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
            element.val('2').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
            element.val('').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
        })

        it('changing the input value without max should not trigger the max validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" max=\"\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('1.00').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            element.val('').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
        })

        it('empty the input value after invalid max should reset the max validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"currency\" max=\"2\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            element.val('4.00').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(false);
            expect(element.hasClass('ng-invalid-max')).toEqual(true);
            element.val('').triggerHandler('input');
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
        })

        it('changing the model value should trigger the max validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"modelValue\" max=\"100\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            $rootScope.modelValue = 200.00;
            $rootScope.$digest();
            expect(element.hasClass('ng-valid')).toEqual(false);
            expect(element.hasClass('ng-invalid-max')).toEqual(true);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
            $rootScope.modelValue = 2.00;
            $rootScope.$apply();
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
            $rootScope.modelValue = undefined;
            $rootScope.$apply();
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
        })

        it('changing the model value without max should not trigger the min validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"modelValue\" max=\"\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            $rootScope.modelValue = 2.00;
            $rootScope.$digest();
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
            $rootScope.modelValue = undefined;
            $rootScope.$digest();
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
        })

        it('changing the model value with invalid value should not trigger the max validator',function() {
            var element = $compile("<input type=\"text\" ng-model=\"modelValue\" max=\"100\"  mask-currency=\"'$'\" />")($rootScope);
            $rootScope.$digest();
            $rootScope.modelValue = 'None parsable value';
            $rootScope.$digest();
            expect(element.hasClass('ng-valid')).toEqual(true);
            expect(element.hasClass('ng-invalid-max')).toEqual(false);
            expect(element.hasClass('ng-invalid-min')).toEqual(false);
        })


        it('should remove numeric character in symbol configuration ',function() {
            var configStr = "{orientation:'r'}"
            var element = $compile("<input type=\"text\" ng-model=\"modelValue\" mask-currency=\"'1'\" config=\""+configStr+"\" />")($rootScope);
            $rootScope.$digest();
            $rootScope.modelValue = 1540;
            $rootScope.$digest();
            expect(element.val()).toBe('1,540.00');
        });

        it('should remove multiple numeric character in symbol configuration ',function() {
            var configStr = "{orientation:'r'}"
            var element = $compile("<input type=\"text\" ng-model=\"modelValue\" mask-currency=\"'123'\" config=\""+configStr+"\" />")($rootScope);
            $rootScope.$digest();
            $rootScope.modelValue = 1540;
            $rootScope.$digest();
            expect(element.val()).toBe('1,540.00');
        });

        it('should remove numeric character containing in symbol configuration ',function() {
            var configStr = "{orientation:'r',indentation:' '}"
            var element = $compile("<input type=\"text\" ng-model=\"modelValue\" mask-currency=\"'a1b'\" config=\""+configStr+"\" />")($rootScope);
            $rootScope.$digest();
            $rootScope.modelValue = 1540.12;
            $rootScope.$digest();
            expect(element.val()).toBe('1,540.12 ab');
        })

        it('should remove multiple numeric character containing in symbol configuration ',function() {
            var configStr = "{orientation:'r',indentation:' '}"
            var element = $compile("<input type=\"text\" ng-model=\"modelValue\" mask-currency=\"'1a1b1'\" config=\""+configStr+"\" />")($rootScope);
            $rootScope.$digest();
            $rootScope.modelValue = 1540.12;
            $rootScope.$digest();
            expect(element.val()).toBe('1,540.12 ab');
        })
    })

    describe('Testing filter', function() {

        it('filter applied to 5000 should return format in YEN',function() {
            var value = $filter('printCurrency')(5000.00,'¥',{decimalSize:0})
            expect(value).toBe('¥5,000');
        })

        it('filter applied to 5000 should return format in YEN with no group',function() {
            var value = $filter('printCurrency')(5500000.00,'¥',{decimalSize:0,group:''})
            expect(value).toBe('¥5500000');
        })

        it('comparing value with currency filter should show the same result', function() {
            var value = 5000.556;
            expect($filter('currency')(value,'$',2)).toBe($filter('printCurrency')(value,'$',{decimalSize:2}))
        })

    })

})
