(function() {
  var ClubhouseProfile, injectScript,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  injectScript = function(opts) {
    var name, ph, script, value;
    script = document.createElement('script');
    for (name in opts) {
      value = opts[name];
      script.setAttribute(name, value);
    }
    ph = document.getElementsByTagName('script')[0];
    return ph.parentNode.insertBefore(script, ph);
  };

  ClubhouseProfile = (function() {
    function ClubhouseProfile(host1) {
      this.host = host1;
      this.addTimerIfOnStory = bind(this.addTimerIfOnStory, this);
      this.handleMutations = bind(this.handleMutations, this);
      this.infect();
      this.listen();
    }

    ClubhouseProfile.prototype.platformConfig = function() {
      return {
        applicationName: 'Clubhouse'
      };
    };

    ClubhouseProfile.prototype.listen = function() {
      document.body.addEventListener('harvest-event:ready', this.addTimerIfOnStory);
      this.harvestTimerButton = this.createButton();
      this.harvestTimerButton.classList.add('attributes editable-attribute');

      return new MutationObserver(this.handleMutations).observe(document.body, {
        childList: true,
        subtree: true
      });
    };

    ClubhouseProfile.prototype.handleMutations = function(mutations) {
      var i, len, node, removedNodes, results;
      results = [];
      for (i = 0, len = mutations.length; i < len; i++) {
        removedNodes = mutations[i].removedNodes;
        results.push((function() {
          var j, len1, results1;
          results1 = [];
          for (j = 0, len1 = removedNodes.length; j < len1; j++) {
            node = removedNodes[j];
            if (this.hasBeenRemoved(node, this.harvestTimerButton)) {
              results1.push(this.addTimerIfOnStory());
            } else {
              results1.push(void 0);
            }
          }
          return results1;
        }).call(this));
      }
      return results;
    };

    ClubhouseProfile.prototype.hasBeenRemoved = function(node, button) {
      return node.contains(button) && !document.body.contains(button) && button !== node;
    };

    ClubhouseProfile.prototype.infect = function() {
      injectScript({
        src: this.host + '/assets/platform.js',
        'data-platform-config': JSON.stringify(this.platformConfig()),
        async: true
      });
      return document.addEventListener('pjax:end', this.addTimerIfOnStory);
    };

    ClubhouseProfile.prototype.addTimerIfOnStory = function() {
      var _, workspace, storyNumber, storyTitleHyphened, ref;
      ref = window.location.pathname.split('/'), _ = ref[0], workspace = ref[1], story = ref[2], storyNumber = ref[3], storyTitleHyphened = ref[4];
      if (!(story && story === 'story' && storyNumber !== 'space')) {
        return;
      }
      return this.addTimer({
        workspace: workspace,
        storyNumber: '[' + storyNumber + ']',
        storyTitle: this.storyTitle(),
        epicName: this.epicName(),
        projectName: this.projectName()
      });
    };

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
      var workspace, storyNumber, storyTitle, epicName, projectName, name, actions, permalink;

      for (name in data) {
        this.harvestTimerButton.dataset[name] = JSON.stringify(data[name]);
      }

      workspace = data.workspace;
      storyNumber = data.storyNumber;
      storyTitle = data.storyTitle;
      epicName = data.epicName;
      projectName = data.projectName;
      permalink = 'https://app.clubhouse.io/' + workspace + '/story/' + storyNumber + '/' + storyTitle;

      this.harvestTimerButton.removeAttribute('data-listening');
      this.harvestTimerButton.setAttribute('data-permalink', permalink);

      actions = document.querySelector('.story-attributes')
      if (actions != null) {
        actions.append(this.harvestTimerButton);
      }

      return this.notifyPlatformOfNewTimers();
    }

    ClubhouseProfile.prototype.createButton = function() {
      var button;
      button = document.createElement('button');
      button.type = 'button';
      button.classList.add('harvest-timer');
      button.setAttribute('data-skip-styling', 'true');
      button.innerHTML = "<svg aria-hidden=\"true\" class=\"octicon octicon-clock\" height=\"16\" role=\"img\" version=\"1.1\" viewBox=\"0 0 14 16\" width=\"14\"><path d=\"M8 8h3v2H7c-0.55 0-1-0.45-1-1V4h2v4z m-1-5.7c3.14 0 5.7 2.56 5.7 5.7S10.14 13.7 7 13.7 1.3 11.14 1.3 8s2.56-5.7 5.7-5.7m0-1.3C3.14 1 0 4.14 0 8s3.14 7 7 7 7-3.14 7-7S10.86 1 7 1z\"></path></svg>\nTrack time";
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