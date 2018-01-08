  // IIFE - Immediately Invoked Function Expression
  (function ($, window, document) {

    // The $ is now locally scoped 

    // Listen for the jQuery ready event on the document
    $(function () {
      // The DOM is ready!
      console.log('The DOM is ready!');
      $(document).ready(function() {
        $.ajaxSetup({ cache: false });
      });

    });

    var calculate = (function() {
      var toHit = function() {
        var hit = $("#tohit").val();
        var reroll = $("#rerollHit").val();
        var out = 1;
      
        if (hit != "") {
          switch (reroll) {
            case "none":
              out = (6 - hit + 1) / 6;
              break;
            case "ones":
              out = 1 - (1 / 6 * (1 / 6 + (hit - 2) / 6) + (hit - 2) / 6);
              break;
            case "fail":
              out = (1 - (hit - 1) / 6 * (hit - 1) / 6);
              break;
          }
        }
        return out;
      };
      
      var toWound = function(t) {
        var s = $("#s").val();
        var w = 0;
        var out = 1;
      
        if (s != "" && t != "") {
          x = s / t;
      
          if (x >= 2) w = 2;
          if (x == 1) w = 4;
          if (x <= 0.5) w = 6;
          if (x < 1 && x > 0.5) w = 5;
          if (x > 1 && x < 2) w = 3;
      
          out = (6 - w + 1) / 6;
        }
      
        return out;
      };
      
      var expectedDamage = function() {
        var damage = $("#damage").val();
        if(damage.startsWith("d")){
          damage = damage.replace("d", "");
          var out = (parseInt(damage) + 1) / 2;  
        }else {
          var out = (parseInt(damage));
        }
        return out;
      };
      
      var expectedHits = function(save) {
        var shots = $("#shots").val();
        var out = shots;
        if (save != 0) {
          out = (1 - ((6 - save + 1) / 6)) * shots;
        }
      
        return out;
      }

      return {
        toHit : toHit,
        toWound : toWound,
        expectedDamage : expectedDamage,
        expectedHits : expectedHits
      }
    })();
    
    $.fn.renderData = function() {
    
      $("#alert").css("display", "block");
      $("#result").css("display", "block");
    
      var hit = calculate.toHit();
      var expectedDamage = calculate.expectedDamage();
    
      $("#resultTable").find("tr:not(:first)").remove();
    
      $.getJSON("data/data.json", function(data) {
        $.each(data, function( i, item ) {
          var wound = calculate.toWound(data[i].T);
          var expectedHits = calculate.expectedHits(data[i].Save);
    
          var chanceToWound = hit * wound;
    
          $("#resultTable").append("<tr><th scope='row'>T: "+data[i].T+ "<br>Save: " +((data[i].Save == 0) ? '-' : data[i].Save)+ "</th>"+
          "<td>"+parseInt(chanceToWound * 100) + "%</td>"+
          "<td>"+(chanceToWound * expectedHits).toFixed(2)+"</td>"+
          "<td>"+(hit * wound * expectedDamage * expectedHits).toFixed(2)+"</td>"+
          "</tr>");
        });
      });
    
    }
    
    // The rest of code goes here!
    console.log('The DOM may not be ready!');

  }(window.jQuery, window, document));

