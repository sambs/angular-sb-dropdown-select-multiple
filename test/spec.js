
describe('sbDropdownSelectMultiple directive', function () {
  var $q, $timeout, compile, scope, iscope, elem, form, input, clear, dropdown;

  beforeEach(module('sbDropdownSelectMultiple'));

  beforeEach(inject(function (_$q_, _$timeout_) {
    $q = _$q_;
    $timeout = _$timeout_;
  }));

  beforeEach(inject(function($rootScope, $compile) {
    compile = function (options) {
      form = angular.element('<form name="form">'+options.template+'</form>');
      scope = $rootScope;
      for (var key in options.scope) { scope[key] = options.scope[key]; }
      $compile(form)(scope);
      scope.$digest();
      elem = form.find('.dropdown-select-multiple');
      input = elem.find('input');
      dropdown = elem.find('.dropdown');
      iscope = input.isolateScope();
      form.appendTo(document.body);
    };
  }));

  afterEach(function () {
    form.remove();
  });

  function stringSource (query) {
    switch (query) {
      case 'a':
        return ['animals', 'automobiles', 'activities'];
      case 'b':
        return ['bikes', 'beverages'];
      default:
        return [];
    }
  }

  function objectSource (query) {
    switch (query) {
      case 'a':
        return [
          { id: 1, display: 'animals' },
          { id: 2, display: 'automobiles' },
          { id: 3, display: 'activities' }
        ];
      case 'b':
        return [
          { id: 4, display: 'bikes' },
          { id: 5, display: 'beverages' }
        ];
      default:
        return [];
    }
  }

  describe('basic operation', function () {

    beforeEach(function () {
      compile({
        template: '<div sb-dropdown-select-multiple sb-source="source" name="x" ng-model="obj.x"></div>',
        scope: { obj: {}, source: stringSource }
      });
    });

    it('should initiate', function() {
      expect(input.length).toBe(1);
      expect(dropdown.length).toBe(1);
      expect(dropdown).toHaveClass('ng-hide');
      expect(scope.form.x.$pristine).toBe(true);
    });

    it('should show choices', function() {
      input.val('a').trigger('change').trigger('focus');
      scope.$digest();
      $timeout.flush();
      expect(dropdown).not.toHaveClass('ng-hide');
      expect(dropdown.find('li').length).toBe(3);
      expect(dropdown.find('li').eq(0).text()).toBe('animals');
      expect(dropdown.find('.dropdown-select-no-results')).toHaveClass('ng-hide');
      expect(scope.form.x.$pristine).toBe(true);
    });

    it('should allow selection of choice', function() {
      input.val('a').trigger('change').trigger('focus');
      scope.$digest();
      $timeout.flush();
      dropdown.find('a').first().click();
      scope.$digest();
      expect(input.val()).toBe('');
      expect(scope.obj.x).toEqual(['animals']);
      expect(scope.form.x.$pristine).toBe(false);
    });
  });

  describe('with initial value', function () {

    beforeEach(function () {
      compile({
        template: '<div sb-dropdown-select-multiple sb-source="source" name="x" ng-model="obj.x"></div>',
        scope: { 
          obj: { x: ['automobiles'] }, 
          source: stringSource 
        }
      });
    });

    it('should compileiate', function() {
      expect(elem.find('.token-input-token-name').first().text()).toBe('automobiles');
      expect(dropdown).toHaveClass('ng-hide');
      expect(scope.form.x.$pristine).toBe(true);
    });
  });


  describe('with objects', function () {

    beforeEach(function () {
      compile({
        template: '<div sb-dropdown-select-multiple sb-source="source" sb-display-property="display" name="x" ng-model="obj.x"></div>',
        scope: { 
          obj: { x: [{ id: 2, display: 'automobiles' }]}, 
          source: objectSource 
        }
      });
    });

    it('should initiate', function() {
      expect(elem.find('.token-input-token-name').first().text()).toBe('automobiles');
      expect(dropdown).toHaveClass('ng-hide');
      expect(scope.form.x.$pristine).toBe(true);
    });
  });

  describe('on an input element', function () {

    beforeEach(function () {
      compile({
        template: '<input sb-dropdown-select-multiple sb-source="source" sb-display-property="display" type="text" name="x" ng-model="obj.x">',
        scope: { 
          obj: { x: [{ id: 2, display: 'automobiles' }]}, 
          source: objectSource 
        }
      });
    });

    it('should initiate', function() {
      expect(elem.find('.token-input-token-name').first().text()).toBe('automobiles');
      expect(dropdown).toHaveClass('ng-hide');
      expect(scope.form.x.$pristine).toBe(true);
    });
  });
});
