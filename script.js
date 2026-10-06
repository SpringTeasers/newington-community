/* ==========================================================================
   NEWINGTON COMMUNITY SITE — SITE SCRIPT
   site/script.js  ·  vanilla JS, no framework, no build step
   --------------------------------------------------------------------------
   Scope is deliberately limited to THREE jobs:
     1. Footer year  — fills <span id="year"> (2026 is the no-JS fallback).
     2. Mobile nav toggle — flips aria-expanded / .is-open on the nav panel,
        closes on Escape, closes on outside click, returns focus to the button.
     3. Businesses search + category filter — hides and shows cards that are
        already in the DOM; updates the live "Showing N of M businesses"
        result count and toggles the .empty-state message.
   Everything else on the site works with JavaScript disabled.
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     1. Footer year
     ------------------------------------------------------------------ */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------------------
     2. Mobile navigation toggle
     ------------------------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  if (toggle && nav) {
    var setNavState = function (open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };

    setNavState(false);

    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      setNavState(!nav.classList.contains('is-open'));
    });

    // Escape closes the panel and returns focus to the toggle.
    document.addEventListener('keydown', function (event) {
      if ((event.key === 'Escape' || event.key === 'Esc') && nav.classList.contains('is-open')) {
        setNavState(false);
        toggle.focus();
      }
    });

    // A click outside the header closes the panel.
    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) { return; }
      if (nav.contains(event.target) || toggle.contains(event.target)) { return; }
      setNavState(false);
    });

    // Selecting a link closes the panel (it is a same-page jump or a nav).
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) { setNavState(false); }
    });

    // Returning to the desktop layout must never leave a stale open state.
    if (window.matchMedia) {
      var wide = window.matchMedia('(min-width: 768px)');
      var onWide = function (event) { if (event.matches) { setNavState(false); } };
      if (wide.addEventListener) {
        wide.addEventListener('change', onWide);
      } else if (wide.addListener) {
        wide.addListener(onWide);
      }
    }
  }

  /* ---------------------------------------------------------------------
     3. Business directory — search + category filter
     Progressive enhancement: every card is in the HTML on load. This code
     only hides and shows cards, keeps one category section per card, hides
     empty sections, and updates the result count.
     ------------------------------------------------------------------ */
  var searchInput = document.getElementById('biz-search');
  var pills = Array.prototype.slice.call(document.querySelectorAll('.filter-pill'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.biz-card'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.cat-section'));
  var emptyState = document.querySelector('.empty-state');
  var countEl = document.querySelector('.result-count');

  if (searchInput && cards.length) {
    var activeCategory = 'all';

    // The no-JS label in the HTML is "Showing 17 of 17 businesses"; keep the
    // exact same wording when JS updates it.
    var updateCount = function (shown) {
      if (!countEl) { return; }
      countEl.textContent = 'Showing ' + shown + ' of ' + cards.length + ' businesses';
    };

    var applyFilter = function () {
      var query = (searchInput.value || '').trim().toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var category = card.getAttribute('data-category') || '';
        var haystack = (card.textContent || '').toLowerCase();
        var categoryOk = activeCategory === 'all' || category === activeCategory;
        var queryOk = query === '' || haystack.indexOf(query) !== -1;
        var visible = categoryOk && queryOk;

        card.hidden = !visible;
        if (visible) { shown += 1; }
      });

      // A category heading with no visible cards is hidden entirely.
      sections.forEach(function (section) {
        var hasVisible = section.querySelector('.biz-card:not([hidden])') !== null;
        section.hidden = !hasVisible;
      });

      updateCount(shown);

      if (emptyState) {
        emptyState.classList.toggle('is-visible', shown === 0);
      }
    };

    searchInput.addEventListener('input', applyFilter);
    searchInput.addEventListener('search', applyFilter);

    pills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        activeCategory = pill.getAttribute('data-filter') || 'all';
        pills.forEach(function (other) {
          other.setAttribute('aria-pressed', other === pill ? 'true' : 'false');
        });
        applyFilter();
      });
    });
  }
}());
