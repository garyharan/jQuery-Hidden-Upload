/**
 * jQuery hidden Upload
 * Gary Haran (c) 2009 - gary@talkerapp.com
 * Licensed under the MIT license
 * some parts from http://valums.com/ajax-upload/ (c) 2008 Andris Valums, http://valums.com
 */
(function($){
  
  function getIframeId(anchor) {
    var i = 0;
    do {
      var id = anchor.attr('id') + "_iframe_" + i++;
    } while( window.frames[id] );
    
    return id;
  }
  
  function createIframe(anchor, id, options) {
    var iframe = $('<iframe src="javascript:false;" />')
      .attr('name', id)
      .attr('id', id)
      .css('display', 'none')
      .appendTo(document.body);

    iframe.load(function() {
      var response;
      var d = iframe.contentDocument || window.frames[iframe.attr('name')].document;
      if (d.readyState && d.readyState != 'complete') return; // fix opera 9.26
      if (d.body && d.body.innerHTML == "false") return ; // fixing Opera 9.64

      if (d.body) {
        response = d.body.innerHTML;
        if (options.responseType && options.responseType.toLowerCase() == 'json') {
          if (d.body.firstChild && d.body.firstChild.nodeName.toUpperCase() == 'PRE') {
            response = d.body.firstChild.firstChild.nodeValue;
          }
          response = (response ? eval("(" + response + ")") : {});
        }
      } else if (d.XMLDocument) {
        response = d.XMLDocument;
      } else {
        response = d;
      }

      anchor.hoverDiv.remove();
      anchor.removeClass(options.hoverClass)
      options.onComplete(response);

      iframe.src = "javascript:'<html></html>';";
    });
    
    return iframe;
  }
  
  function createForm(anchor, id, options) {
    return $('<form method="post" enctype="multipart/form-data" />')
      .attr('action', options.action)
      .attr('target', id)
      .attr('id', 'form_' + id)
      .css({
        'position': 'absolute',
        'left': '-14480px',
        'top': '-14480px'
      })
      .append(anchor.input)
      .appendTo(document.body);
  }
  
  // create a form that will upload
  function fireUpload(anchor, options){
    if (anchor.value === '') {
      return
    }
    
    var id = getIframeId(anchor);
    var iframe = createIframe(anchor, id, options);
    var form = createForm(anchor, id, options);
    
    if (options.closeConnection && $.browser.safari){
      $.get(options.closeConnection, function() { 
        form.submit();
      });
    } else {
      form.submit()
    }
  }
  
  $.fn.ajaxUpload = function(options) {
    var options = $.extend({
      action: $(this).attr('href'),
      name: 'upload',
      data: {},
      responseType: 'json',
      closeConnection: '',
      hoverClass: 'hover',
      onSubmit: function(){},
      onComplete: function(response){}
    }, options);
    
    var anchor = this;
    
    // make a div hover above item with file upload in it
    $(this).mouseover(function() {
      var hoverDivId = $(this).attr('id') + '_upload_iframe';
      if (!$('#' + hoverDivId).length){ 
        var hoverDiv = $('<div/>')
          .css({
            'overflow': 'hidden', 
            'opacity': '0',
            'z-index': 2147483583
          })
          .attr('id', hoverDivId)
          .appendTo($(document.body));
        
        anchor.hoverDiv = hoverDiv;
        anchor.input = $('<input type="file" name="' + options.name + '" />').css({
          'margin': '-5px 0 0 -175px',
          'padding': 0,
          'width': '220px',
          'height': '30px',
          'font-size': '280px',
          'cursor': 'pointer'
        }).mouseover(function() {
          $(anchor).addClass(options.hoverClass);
        }).mouseout(function() {
          $(anchor).removeClass(options.hoverClass);
        }).change(function() {
          if (options.onSubmit() !== false){
            fireUpload(anchor, options);
          }
        })
        
        hoverDiv.html(anchor.input);
      }
      $('#' + hoverDivId).clonePosition(this);
    });
    
    return this;
  }
})(jQuery);