/**
 * This plugin supports the scrolling effects on wdn-band imagery
 *
 * Any feature which requires monitoring the scroll depth of the user should
 * user the wdn-scroll-watch class
 *
 * Flipbook over a set of figure elements when the user scrolls between two points
 * class="wdn-scroll-watch lerp flipbook" data-lerp-start=".start-el" data-lerp-end=".end-el"
 * class="wdn-scroll-watch locked"   Use on a group of figures to lock within the viewport while scrolling a band
 * class="wdn-scroll"   Use on the scrollable content adjecent to the locked imagery
 *
 * For the flipbook you must define two points to interpolate between
 * and create the flipbook effect.
 * 
 * Required Attributes:
 * data-lerp-start Define a secector to begin interpolation at
 * data-lerp-end   Define a selector to end interpolation at
 * e.g. data-lerp-start="#lerp-start" data-lerp-end="#lerp-end" will flip
 * through all figures within the flipbook as the user's viewport scrolls
 *  between id="lerp-start" and id="lerp-end"
 *
 */

define(['jquery', 'wdn'], function($, WDN) {
	var imageryUpdate = function() {
		var depth = Math.floor($(window).scrollTop());
		$('.wdn-scroll-watch').each(function(index, value) {

			var $this = $(this);

			if ($this.hasClass('lerp')) {
				var lerpstart_el      = $this.attr('data-lerp-start'),
					lerpend_el        = $this.attr('data-lerp-end'),
					lerp_start_offset = $(lerpstart_el).offset(),
					lerp_end_offset   = $(lerpend_el).offset(),
					percent 		  = lerp(lerp_start_offset, lerp_end_offset, depth);

				if ($this.hasClass('scale')) {
					scale($this, percent);
				}

				if ($this.hasClass('flipbook')) {
					flipbook($this, percent);
				}
			}
			
			if ($this.hasClass('locked')) {
				lockedAside($this, depth);
			}

		});
	};

	/**
	 * A locked aside allows content to be locked aside scrolling content
	 * Typically a figure is used as a backround which is displayed along side scrolling content.
	 * 
	 * @var $this jQuery'd region to lock position of
	 * @var depth What depth we're currently at
	 */
	var lockedAside = function($this, depth) {
		var parent        = $this.parent(),
			parent_offset = parent.offset().top,
			parent_height = parent.height(),
			window_height = $(window).height();
	
		if (depth < parent_offset) {
			// Above locked region
			$this.removeClass('fixed bottom');
	
		} else if ((depth >= parent_offset)
			&& ((depth + window_height) < (parent_height + parent_offset)) ) {
			// Currently viewing locked region
			$this.css('top', '0');
			$this.addClass('fixed').removeClass('bottom');
		} else {
			// Below locked region
			$this.removeClass('fixed');
			if (window_height < $this.height()) {
				$this.addClass('bottom');
				$this.css('top', 'auto');
			} else {
				var pinned_top = parent_height - window_height;
				$this.css('top', pinned_top+'px');
			}
		}
	};

	var scale = function($this, percent) {
		var lerpstart_scale      = $this.attr('data-scale-start'),
			lerpend_scale        = $this.attr('data-scale-end'),
			scale_diff           = lerpend_scale - lerpstart_scale,
			shown_scale          = parseFloat(lerpstart_scale) + percent * scale_diff;
		$this.css('transform', 'scale('+shown_scale+')');
	};

	/**
	 * A flipbook swaps between a series of figures
	 * 
	 * @var $this   jQuery'd element that holds a series of figures
	 * @var percent A float percentage from 0-1 which will adjust which figure to show
	 */
	var flipbook = function($this, percent) {
		var shownfigure = ':first-of-type',
			$figures    = $this.children('figure');

		if (percent > 0
			&& percent < 1) {
			shownfigure = ':nth-of-type(' + Math.ceil($figures.length * percent) + ')';
		} else {
			shownfigure = ':last-of-type';
		}

		var $shownFigure = $figures.filter(shownfigure);
		$shownFigure.show().end()
		.not($shownFigure).hide();

		return $shownFigure;
		
	};

	/**
	 * Get the percentage of position between two points v0, v1, 
	 * 
	 * @return float between 0 and 1
	 */
	var lerp = function(lerp_start_offset, lerp_end_offset, depth) {
		if ((depth > lerp_start_offset.top)
			&& (depth < lerp_end_offset.top)) {
			return (depth - lerp_start_offset.top)/(lerp_end_offset.top - lerp_start_offset.top);
		} else if (depth > lerp_end_offset.top) {
			return 1;
		}
		return 0;
	};

	var Plugin = {
		initialize : function() {
			WDN.loadCSS(WDN.getTemplateFilePath('css/modules/band_imagery.css'));
			$('.wdn-scroll-watch').parent().css('position', 'relative');
			$(window).scroll(function() {
					scrollTimeout = setTimeout(imageryUpdate, 50);
				}
			);
		}

	};

	return Plugin;
});
