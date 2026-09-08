/*
 * Auki Henry native article sharing
 * No third-party SDKs, trackers, analytics, or cookies.
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function getCanonicalUrl() {
    var canonical = document.querySelector('link[rel="canonical"]');
    return canonical && canonical.href
      ? canonical.href
      : window.location.href.split("#")[0];
  }

  function getArticleTitle() {
    var heading = document.querySelector("h1.post-title, h1.entry-title");
    return (heading && heading.textContent.trim()) || document.title;
  }

  function getShareImage() {
    var image = document.querySelector('meta[property="og:image"]');
    return image && image.content ? image.content : "";
  }

  function popup(url) {
    var width = 720;
    var height = 620;
    var left = Math.max(0, Math.round((window.screen.width - width) / 2));
    var top = Math.max(0, Math.round((window.screen.height - height) / 2));

    var win = window.open(
      url,
      "aukiShare",
      "noopener,noreferrer,width=" + width +
        ",height=" + height +
        ",left=" + left +
        ",top=" + top +
        ",scrollbars=yes,resizable=yes"
    );

    if (win) {
      try {
        win.opener = null;
      } catch (e) {}
    }
  }

  function setCopied(button) {
    var label = button.querySelector(".auki-share-label");
    var original = label ? label.textContent : "";

    button.classList.add("is-copied");

    if (label) {
      label.textContent = "Copied";
    }

    window.setTimeout(function () {
      button.classList.remove("is-copied");

      if (label) {
        label.textContent = original || "Copy link";
      }
    }, 1800);
  }

  function fallbackCopy(text, button) {
    var area = document.createElement("textarea");

    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";

    document.body.appendChild(area);
    area.select();

    try {
      if (document.execCommand("copy")) {
        setCopied(button);
      }
    } catch (e) {}

    document.body.removeChild(area);
  }

  ready(function () {
    var components = document.querySelectorAll(".auki-share");

    if (!components.length) {
      return;
    }

    var url = getCanonicalUrl();
    var title = getArticleTitle();
    var image = getShareImage();

    components.forEach(function (component) {
      if (navigator.share) {
        component.classList.add("has-native-share");
      }

      component
        .querySelectorAll("[data-share-network]")
        .forEach(function (link) {
          var network = link.getAttribute("data-share-network");
          var shareUrl = "";

          if (network === "facebook") {
            shareUrl =
              "https://www.facebook.com/sharer/sharer.php?u=" +
              encodeURIComponent(url);

          } else if (network === "x") {
            shareUrl =
              "https://twitter.com/intent/tweet?text=" +
              encodeURIComponent(title) +
              "&url=" +
              encodeURIComponent(url);

          } else if (network === "reddit") {
            shareUrl =
              "https://www.reddit.com/submit?url=" +
              encodeURIComponent(url) +
              "&title=" +
              encodeURIComponent(title);

          } else if (network === "pinterest") {
            shareUrl =
              "https://www.pinterest.com/pin/create/button/?url=" +
              encodeURIComponent(url) +
              (image
                ? "&media=" + encodeURIComponent(image)
                : "") +
              "&description=" +
              encodeURIComponent(title);

          } else if (network === "email") {
            link.href =
              "mailto:?subject=" +
              encodeURIComponent(title) +
              "&body=" +
              encodeURIComponent(title + "\n\n" + url);

            return;
          }

          if (shareUrl) {
            link.href = shareUrl;

            link.addEventListener("click", function (event) {
              event.preventDefault();
              popup(shareUrl);
            });
          }
        });

      var nativeButton = component.querySelector("[data-native-share]");

      if (nativeButton) {
        if (!navigator.share) {
          nativeButton.hidden = true;
        } else {
          nativeButton.addEventListener("click", function () {
            navigator
              .share({
                title: title,
                url: url
              })
              .catch(function () {
                /* User cancellation needs no action. */
              });
          });
        }
      }

      var copyButton = component.querySelector("[data-copy-link]");

      if (copyButton) {
        copyButton.addEventListener("click", function () {
          if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard
              .writeText(url)
              .then(function () {
                setCopied(copyButton);
              })
              .catch(function () {
                fallbackCopy(url, copyButton);
              });

          } else {
            fallbackCopy(url, copyButton);
          }
        });
      }
    });
  });
})();
