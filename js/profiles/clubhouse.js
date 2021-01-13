(function() {
  var ClubhouseProfile, injectScript,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  injectScript = function(opts) {
    var name, ph, script, value;
    script = document.createElement('script');
    switch (typeof opts) {
      case 'object':
        for (name in opts) {
          value = opts[name];
          script.setAttribute(name, value);
        }
        break;
      case 'string':
        script.innerHTML = opts;
    }
    ph = document.getElementsByTagName('script')[0];
    return ph.parentNode.insertBefore(script, ph);
  };

  ClubhouseProfile = (function() {
    function ClubhouseProfile(host1) {
      this.host = host1;
      this.addTimerIfOnStory = bind(this.addTimerIfOnStory, this);
      this.handleMutations = bind(this.handleMutations, this);
      this.actionSelector = '#updateStoryRequesterOwnerFields';
      this.platformLoaded = false;
      this.listen();
      this.infect();
    }

    ClubhouseProfile.prototype.platformConfig = function() {
      return {
        applicationName: 'Clubhouse'
      };
    };

    ClubhouseProfile.prototype.listen = function() {
      document.body.addEventListener('harvest-event:ready', (function(_this) {
        return function() {
          _this.platformLoaded = true;
          return _this.addTimerIfOnStory();
        };
      })(this));
      this.harvestTimerButton = this.createButton();
      this.harvestTimerButton.classList.add('attribute', 'editable-attribute');

      return window.addEventListener("message", (function(_this) {
        return function(event) {
          if (event.data.clubhouseUrlChanged == null) {
            return;
          }
          return _this.addTimerIfOnStory();
        };
      })(this))

    }

    ClubhouseProfile.prototype.hasBeenRemoved = function(node, button) {
      return node.contains(button) && !document.body.contains(button) && button !== node;
    };

    ClubhouseProfile.prototype.infect = function() {
      injectScript({
        src: this.host + '/assets/platform.js',
        'data-platform-config': JSON.stringify(this.platformConfig()),
        async: true
      });
      return injectScript("(" + this.clubhouseUrlMonitor + ")();")
    };

    ClubhouseProfile.prototype.clubhouseUrlMonitor = function() {
      var change, fn;
      change = function() {
        return window.postMessage({
          clubhouseUrlChanged: true
        }, "*");
      };
      fn = window.history.pushState;
      window.history.pushState = function() {
        fn.apply(window.history, arguments);
        return change();
      };
      return window.addEventListener("popstate", change);
    }

    ClubhouseProfile.prototype.addTimerIfOnStory = function() {
      var _, workspace, storyNumber, storyTitleHyphened, ref;
      ref = window.location.pathname.split('/'), _ = ref[0], workspace = ref[1], story = ref[2], storyNumber = ref[3], storyTitleHyphened = ref[4];
      if (!(story && story === 'story')) {
        return;
      }
      return this.whenReadyForTimer((function(_this) {
        return function() {
          return _this.addTimer({
            workspace: {
              id: workspace,
              workspace: workspace
            },
            storyNumber: {
              id: storyNumber,
              storyNumber: storyNumber
            },
            storyTitle: {
              id: storyTitleHyphened,
              storyTitle: _this.storyTitle()
            },
            epicName: {
              id: _this.epicName(),
              epicName: _this.epicName()
            },
            projectName: {
              id: _this.projectName(),
              projectName: _this.projectName()
            },
            item: {
              id: storyNumber,
              name: (_this.epicName() !== 'None' ? '[' + _this.epicName() + ']' : '' ) + '(' + _this.storyNumber() + ') ' + _this.storyTitle()
            },
          })
        }
      })(this));
    };

    ClubhouseProfile.prototype.whenReadyForTimer = function(callback) {
      var poll;
      poll = (function(_this) {
        return function() {
          if (!document.querySelector(_this.actionSelector)) {
            return;
          }
          window.clearInterval(_this.interval);
          return callback();
        };
      })(this);
      window.clearInterval(this.interval);
      return this.interval = window.setInterval(poll, 1000);
    }

    ClubhouseProfile.prototype.storyTitle = function() {
      var ref;
      return (ref = document.querySelector('h2.story-name')) != null ? ref.innerText : void 0;
    };

    ClubhouseProfile.prototype.storyNumber = function() {
      var ref;
      return (ref = document.querySelector('.story-dialog .right-column .story-id input')) != null ? ref.value : void 0;
    };

    ClubhouseProfile.prototype.epicName = function() {
      var ref;
      return (ref = document.querySelector('#story-dialog-epic-dropdown .value')) != null ? ref.innerText : void 0;
    };

    ClubhouseProfile.prototype.projectName = function() {
      var ref;
      return (ref = document.querySelector('.story-project .value')) != null ? ref.innerText : void 0;
    };

    ClubhouseProfile.prototype.addTimer = function(data) {
      var workspace, storyNumber, storyTitle, epicName, projectName, name, actions, permalink, item;

      for (name in data) {
        this.harvestTimerButton.dataset[name] = JSON.stringify(data[name]);
      }

      workspace = data.workspace;
      storyNumber = data.storyNumber;
      storyTitle = data.storyTitle;
      epicName = data.epicName;
      projectName = data.projectName;
      permalink = 'https://app.clubhouse.io/' + workspace.id + '/story/' + storyNumber.id + '/' + storyTitle.id;

      this.harvestTimerButton.removeAttribute('data-listening');
      this.harvestTimerButton.setAttribute('data-permalink', permalink);
      this.harvestTimerButton.classList.remove('disabled');
      this.harvestTimerButton.classList.add('harvest-timer');

      actions = document.querySelector("div.story-attributes");
      if (actions != null) {
        actions.insertBefore(this.harvestTimerButton, actions.children[7]);
      }

      return this.notifyPlatformOfNewTimers();
    }

    ClubhouseProfile.prototype.createButton = function() {
      var button;
      button = document.createElement('div');
      button.classList.add('harvest-timer', 'attribute', 'editable-attribute');
      button.setAttribute('data-skip-styling', 'true');
      button.innerHTML = "<svg aria-hidden=\"true\" class=\"octicon octicon-clock\" height=\"16\" role=\"img\" version=\"1.1\" viewBox=\"0 0 14 16\" width=\"14\"><path d=\"M8 8h3v2H7c-0.55 0-1-0.45-1-1V4h2v4z m-1-5.7c3.14 0 5.7 2.56 5.7 5.7S10.14 13.7 7 13.7 1.3 11.14 1.3 8s2.56-5.7 5.7-5.7m0-1.3C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7S10.86 1 7 1z\"></path></svg>\nTrack with Harvest";
      return button;
    }

    ClubhouseProfile.prototype.notifyPlatformOfNewTimers = function() {
      var evt, ref;
      evt = new CustomEvent('harvest-event:timers:chrome:add');
      return (ref = document.querySelector('#harvest-messaging')) != null ? ref.dispatchEvent(evt) : void 0;
    }

    return ClubhouseProfile;

  })();

  chrome.runtime.sendMessage({
    type: 'getHost'
  }, function(host) {
    return new ClubhouseProfile(host);
  });

}).call(this);