(function ($, window, document) {
  $(function () {
    $(document).ready(function () {
      $.ajaxSetup({ cache: false });
    });
  });

  var calculate = (function () {
    var toHit = function () {
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

    var toWound = function (t) {
      var s = $("#s").val();
      var reroll = $("#rerollWound").val();
      var splinterCheck4 = $("#splinter4").prop("checked");
      var splinterCheck6 = $("#splinter6").prop("checked");
      var w = 0;
      var out = 1;

      if (s != "" && t != "" || splinterCheck4 || splinterCheck6) {

        if(splinterCheck4){
          w = 4;
        } else if (splinterCheck6) {
          w = 6;
        } else {
          x = s / t;

          if (x >= 2) w = 2;
          if (x == 1) w = 4;
          if (x <= 0.5) w = 6;
          if (x < 1 && x > 0.5) w = 5;
          if (x > 1 && x < 2) w = 3;
        }


        switch (reroll) {
          case "none":
            out = (6 - w + 1) / 6;
            break;
          case "ones":
            out = 1 - (1 / 6 * (1 / 6 + (w - 2) / 6) + (w - 2) / 6);
            break;
          case "fail":
            out = (1 - (w - 1) / 6 * (w - 1) / 6);
            break;
        }
      }

      return out;
    };

    var expectedDamage = function () {
      var damage = $("#damage").val();
      if (damage.startsWith("d")) {
        damage = damage.replace("d", "");
        var out = (parseInt(damage) + 1) / 2;
      } else {
        var out = (parseInt(damage));
      }
      return out;
    };

    var expectedHits = function (save) {
      var shots = $("#shots").val();
      var out = shots;
      if (save != 0) {
        out = (1 - ((6 - save + 1) / 6)) * shots;
      }

      return out;
    }

    return {
      toHit: toHit,
      toWound: toWound,
      expectedDamage: expectedDamage,
      expectedHits: expectedHits
    }
  })();

  $.fn.renderCalc = function () {

    $("#alert").css("display", "block");
    $("#result").css("display", "block");

    var hit = calculate.toHit();
    var expectedDamage = calculate.expectedDamage();

    $("#resultTable").find("tr:not(:first)").remove();

    $.getJSON("data/data.json", function (data) {
      $.each(data, function (i, item) {
        var wound = calculate.toWound(data[i].T);
        var expectedHits = calculate.expectedHits(data[i].Save);

        var chanceToWound = hit * wound;

        $("#resultTable").append("<tr><th scope='row'>T: " + data[i].T + "<br>Save: " + ((data[i].Save == 0) ? '-' : data[i].Save) + "</th>" +
          "<td>" + parseInt(chanceToWound * 100) + "%</td>" +
          "<td>" + (chanceToWound * expectedHits).toFixed(2) + "</td>" +
          "<td>" + (hit * wound * expectedDamage * expectedHits).toFixed(2) + "</td>" +
          "</tr>");
      });
    });
  };

  var dice = (function () {
    var throwDice = function () {
      var numberOfDice = $("#dice").val();
      var toHit = $("#toHit").val();
      var rerollHit = $("#rerollHit").val();
      var toWound = $("#toWound").val();
      var rerollWound = $("#rerollWound").val();

      var completeResults = {
        "results" : [],
        "hits" : 0,
        "wounds" : 0,
        "wounds6": 0
      };

      for (var i = 0; i < numberOfDice; i++) {
        var result = {
          "toHit": Math.round(Math.random() * 5) + 1,
          "toHitReroll": 0,
          "toHitSuccess": false,
          "toWound": 0,
          "toWoundReroll": 0,
          "toWoundSuccess" : false,
        }

        if(result.toHit < toHit){
          switch (rerollHit) {
            case "none": break;
            case "ones":
              if (result.toHit == 1) {
                result.toHitReroll = Math.round(Math.random() * 5 + 1);
              }
              break;
            case "fail":
              result.toHitReroll = Math.round(Math.random() * 5 + 1);
              break;
          }
        }
        if(result.toHit >= toHit || result.toHitReroll >= toHit){
          completeResults.hits++;
          result.toHitSuccess = true;
        }
        
        completeResults.results.push(result);
      }

      for (var i = 0; i < completeResults.results.length; i++) {
        if(completeResults.results[i].toHitSuccess){
          completeResults.results[i].toWound = Math.round(Math.random() * 5) + 1;

          if(completeResults.results[i].toWound < toWound){
            switch (rerollWound) {
              case "none": break;
              case "ones":
                if (completeResults.results[i].toWound == 1) {
                  completeResults.results[i].toWoundReroll = Math.round(Math.random() * 5 + 1);
                }
                break;
              case "fail":
              completeResults.results[i].toWoundReroll = Math.round(Math.random() * 5 + 1);
                break;
            }
          }
          if(completeResults.results[i].toWound >= toWound || completeResults.results[i].toWoundReroll >= toWound){
            completeResults.wounds++;
            completeResults.results[i].toWoundSuccess = true;
          }

          if(completeResults.results[i].toWound == 6){
            completeResults.wounds6++;
          }

        }
      }
      return completeResults;
    }

    return {
      throwDice: throwDice
    }

  })();

  $.fn.renderDice = function () {

    var result = dice.throwDice();
    $("#result").css("display", "block");

    $("#resultTable").find("tr:not(:first)").remove();
    $("#summary").empty();

    $("#summary").append(result.hits +" Hits, <b>"+ result.wounds+"</b> Wounds! <br>" + result.wounds6 + " Sixes on Wound Roll")

    for (var i = 0; i < result.results.length; i++) {
      $("#resultTable").append("<tr " + ((result.results[i].toWoundSuccess) ? 'class="table-success"' : '') + ">"+
          "<td>" + result.results[i].toHit + "</td>" +
          "<td>" + ((result.results[i].toHitReroll == 0) ? '-' : result.results[i].toHitReroll)+ "</td>" +
          "<td>" + ((result.results[i].toWound == 0) ? '-' : result.results[i].toWound) + "</td>" +
          "<td>" + ((result.results[i].toWoundReroll == 0) ? '-' : result.results[i].toWoundReroll) +"</td>" +
          "</tr>");   
    }


  };

  $.fn.enableS = function() {
    $("#s").prop("disabled", false);
  };

  $.fn.disableS = function() {
    $("#s").prop("disabled", true);
  };
}(window.jQuery, window, document));

