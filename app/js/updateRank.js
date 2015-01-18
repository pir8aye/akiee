/* This module deals with html creation of certain tasks */
"use strict";
var assert = require("assert");
var enterTask = require("./enterTask");
var util = require("./util");
var editor = require("./editor")

/*
 * ==========
 * Constants:
 */
var RANK = "RANK: ";

/*
 * ==========
 * Globals:
 */
var deepEqual = assert.deepEqual;

/* DomElement EditorSession -> Void
 * set the rank of el one higher
 */
function upRank(el, ES, ED, showTask, saveFile) {
    moveRank(el, ES, ED, showTask, saveFile, "up");
}

/* DomElement EditorSession Editor Function -> Void
 * set the rank of el one lower
 */
function downRank(el, ES, ED, showTask, saveFile) {
    moveRank(el, ES, ED, showTask, saveFile, "down");
}

/* DomElement EditorSession Editor Function String -> Void
 * move the rank of el 
 */
function moveRank(el, ES, ED, showTask, saveFile, upOrDown) {
    var content = ED.getSession().getValue();
    var lon = util.getNodes(content);
    
    var currentRow = el.parentNode;
    var currentHeadline = currentRow.children[1].innerHTML;
    var currentState = currentRow.children[0].children[0].innerHTML;
    var currentNode = nodeWithHeadline(lon, currentHeadline, currentState);
    var currentRank = parseInt(currentNode.rank);
    
    if (upOrDown === "up") {
        try {
            var borderRow = currentRow.previousElementSibling;
        }
        catch (e) {
            console.log("Element ist allready first in Backlog.");
            return;
        }
    } else {
        try {
            var borderRow = currentRow.nextElementSibling;
        }
        catch (e) {
            console.log("Element ist allready last in Backlog.");
            return;
        }
    }
    
    var borderState = borderRow.children[0].children[0].innerHTML;
    if (currentState !== borderState) {
        console.log("State of task allready changed");
        return;
    }
    
    var borderHeadline = borderRow.children[1].innerHTML;
    var borderNode = nodeWithHeadline(lon, borderHeadline, borderState);
    var borderRank = parseInt(borderNode.rank);
    
    if (borderRank === "" | borderRank === undefined) {
        console.log(borderHeadline + " has no Rank.");
        return;
    }
    
    if (currentRank === "" | currentRank === undefined) {
        // current Headline is not rated yet, create ranking
        // currentRank = enterTask.newRank();
        console.log(currentHeadline + " has no Rank.");
        return;
    }
    
    if (upOrDown === "up") {
        var lon = lon.map(function(key, val, array) {
            if (parseInt(key.rank) >= borderRank && parseInt(key.rank) < currentRank) {
                var rank = parseInt(key.rank) + 1;
                key.rank = rank.toString();
            }
            return key;
        });
    } else {
       var lon = lon.map(function(key, val, array) {
                if (parseInt(key.rank) <= borderRank && parseInt(key.rank) > currentRank) {
                    var rank = parseInt(key.rank) - 1;
                    key.rank = rank.toString();
                }
                return key;
            });     
    }
    currentNode.rank = borderRank;
    
    //console.log(currentRank);
    //console.log(borderRank);
    //console.log(lon);
    
    var editorContent = "";
    lon.forEach(function(e) {
       if (e.level === 1) {
           editorContent += "# ";
       } else if (e.level === 2) {
           editorContent += "## ";
       }
       
       if (e.todo) {
           editorContent += e.todo + " ";
       }
       
       editorContent += e.headline  + "\n";
       
       if (e.body) {
           editorContent += e.body.trim() + "\n\n";
       }
       
       if (e.rank) {
           editorContent += RANK + e.rank + "\n";
       }
    });
    
    //console.log(editorContent);
    
    editor.setEditorContent(ED, ES, lon)
    
    // update view 
    showTask(currentState);
}

/* ListOfNodes String String ->  Node
 * consumes a ListOfNodes a headline and a status, returns the found node or undefined
 */
deepEqual(nodeWithHeadline([{"headline":"Head 1", "todo":"DOING"},{"headline":"Head 2", "todo":"DOING"}], "Head 1", "DOING"), {"headline":"Head 1", "todo":"DOING"});
deepEqual(nodeWithHeadline([{"headline":"Head 1", "todo":"DOING"},{"headline":"Head 2", "todo":"DOING"}], "Not Head", "DOING"), undefined);

function nodeWithHeadline(lon, headline, status) {
    return lon.filter(function (e) {
            return (e.headline === headline && e.todo === status);
        })[0];
}

exports.upRank = upRank;
exports.downRank = downRank;