(function() {
  var ClubhouseProfile, injectScript,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments) } }

  injectScript = function(opts) {
    var name, ph, script, value
    script = document.createElement("script")
    for (name in opts) {
      value = opts[name]
      script.setAttribute(name, value)
    }
    ph = document.getElementsByTagName("script")[0]
    return ph.parentNode.insertBefore(script, ph)
  }

  ClubhouseProfile = (function() {
    function ClubhouseProfile(host1) {
      this.host = host1
      this.addTimerIfOnStory = bind(this.addTimerIfOnStory, this)
      this.listen()
      this.infect()
    }

    ClubhouseProfile.prototype.platformConfig = function() {
      return {
        applicationName: "Clubhouse"
      }
    }

    ClubhouseProfile.prototype.listen = function() {
      document.body.addEventListener("harvest-event:ready", this.addTimerIfOnStory)
      
    }

    ClubhouseProfile.prototype.addTimerIfOnStory = function() {
      var _, workspace, storyNumber, storyTitle, ref
      ref = window.location.pathname.split("/"), _ = ref[0], workspace = ref[1], story = ref[2], storyNumber = ref[3], storyTitleHyphened = ref[4]
      if (!(story && story !== "story" && (storyNumber === "space" && !Number.isInteger(storyNumber)))) {
        return
      }

      return this.addTimer({
        workspace: workspace,
        storyNumber: '[' + storyNumber + ']',
        storyTitle: this.storyTitle(),
        epicName: this.epicName(),
        projectName: this.projectName()
      })
    }

    ClubhouseProfile.prototype.storyTitle = function() {
      var ref
      return (ref = document.querySelector('h2.story-name') != null ? ref.innerText : void 0 )
    }

    ClubhouseProfile.prototype.storyNumber = function() {
      var ref
      return (ref = document.querySelector('.story-dialog .right-column .story-id input') != null ? ref.value : void 0 )
    }

    ClubhouseProfile.prototype.epicName = function() {
      var ref
      return (ref = document.querySelector('#story-dialog-epic-dropdown .value') != null ? ref.innerText : void 0 )
    }

    ClubhouseProfile.prototype.projectName = function() {
      var ref
      return (ref = document.querySelector('.story-project .value') != null ? ref.innerText : void 0 )
    }

    ClubhouseProfile.prototype.addTimer = function(data) {
      
    }

  })()

  chrome.runtime.sendMessage({
    type: "getHost"
  }, function(host) {
    return new ClubhouseProfile(host)
  })()
}).call(this)