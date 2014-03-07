/* jshint browser: true, es3: true */

angular.module('sbDropdownSelectMultiple', ['sbTokenInput', 'sbHighlightGroup', 'sbDebounce', 'sbPopover'])
  
  .directive('sbDropdownSelectMultiple', ['$q', 'sbTokenInputDirective', 'sbDebounce', function ($q, directive, debounce) {

    var def = {}, parent = directive[0];

    // Copy the parent directive definition
    angular.extend(def, parent);

    def.priority = 1;

    def.require = 'ngModel';

    def.scope = {
      source: '&sbSource',
      placeholder: '@placeholder',
      formatDisplay: '&sbFormatDisplay',
      displayProperty: '@sbDisplayProperty',
      track: '&sbTrack',
      trackingProperty: '@sbTrackingProperty'
    };

    def.template = [
      '<div class="dropdown-select-multiple input-container" ng-class="{\'dropdown-select-waiting\': waiting}">',
        parent.template,
        '<div class="dropdown-select-dropdown dropdown" sb-popover-show="show">',
          '<ul sb-highlight-group sb-highlight-class="dropdown-highlighted" sb-disabled="!show" sb-auto-highlight>',
            '<li ng-repeat="result in filtered = (results|filter:hasntToken)">',
              '<a class="dropdown-select-item dropdown-item" ng-bind="formatDisplay(result)" ',
                   'sb-highlight-index="{{$index}}" sb-highlight-select="select(result)"></a>',
            '</li>',
          '</ul>',
          '<div class="dropdown-select-no-results dropdown-select-item dropdown-item" ng-hide="filtered.length">No results</div>',
        '</div>',
      '</div>'
    ].join('');

    var cache = {};

    // Override link function
    def.link = function (scope, elem, attrs, ctrl) {

      // Call parent link function
      parent.link.call(this, scope, elem.find('.token-input'), attrs);

      var input = elem.find('input');

      scope.source = scope.source();
      scope.waiting = false;
      scope.show = false;
      scope.results = [];

      scope.$watch('input', function (val, prev) {
        if (val === prev) {
          // Fetch default results
          scope.search('');
          return;
        }

        if (!val) {
          scope.waiting = false;
          scope.complete = false;
          //ctrl.$setValidity('incomplete', true);
          if ('$defaultResults' in cache && cache.$defaultResults.length) {
            scope.results = cache.$defaultResults;
            scope.show = true;
          } else {
            scope.show = false;
          }
          return;
        }

        //if (ctrl.$viewValue && val == scope.formatDisplay(ctrl.$viewValue)) {
          //ctrl.$setValidity('incomplete', true);
          //return;
        //}

        //ctrl.$setValidity('incomplete', false);

        if (val in cache) {
          scope.results = cache[val];
          scope.waiting = false;
          scope.show = true;
        } else { 
          scope.search(val);
          scope.waiting = true;
        }
      });
        
      scope.search = debounce(function (query) {
        $q.when(scope.source(query)).then(function (results) {
          cache[query || '$defaultResults'] = results;
          if (scope.input != query) return;
          scope.results = results;
          scope.waiting = false;
          if (document.activeElement !== input[0]) return;
          scope.show = true;
        }, function (err) {
          console.log(err);
        });
      }, 500);

      scope.select = function (val) {
        scope.show = false;
        scope.input = '';
        scope.addToken(val);
        //ctrl.$setValidity('incomplete', true);
      };

      scope.hasntToken = function (token) {
        return !scope.hasToken(token);
      };

      scope.$watch('tokens', function (val, prev) {
        if (val === prev) return;
        ctrl.$setViewValue(val);
      }, true);

      ctrl.$render = function () {
        if (ctrl.$viewValue) {
          scope.tokens = ctrl.$viewValue;
        }
      };

      // Open on focus
      input.on('focus', function () {
        scope.openIfResults();
      });

      // Open on click - needed if already focussed
      input.on('click', function () {
        scope.openIfResults();
      });

      // Open on down key press
      input.on('keydown', function (event) {
        if (event.which == 40) {
          event.preventDefault();
          scope.openIfResults();
        }
      });

      scope.openIfResults = function () {
        if (!scope.show && scope.results && scope.results.length) {
          scope.$apply(function () {
            scope.show = true;
          });
        }
      };

    };

    // Delete compile function else the new link function wont be called
    delete def.compile;

    // Return the definition
    return def;
  }]);
