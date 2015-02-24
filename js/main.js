// config vars

var statesCookieName = 'mobile_guide_states';

(function(window, $, PhotoSwipe){
    
    $(document).ready(function(){
        
        $('div.gallery-page')
            .live('pageshow', function(e){
                
                var 
                    currentPage = $(e.target),
                    options = {},
                    photoSwipeInstance = $("ul.gallery a", e.target).photoSwipe(options,  currentPage.attr('id'));
                    
                return true;
                
            })
            
            .live('pagehide', function(e){
                
                var 
                    currentPage = $(e.target),
                    photoSwipeInstance = PhotoSwipe.getInstance(currentPage.attr('id'));

                if (typeof photoSwipeInstance != "undefined" && photoSwipeInstance != null) {
                    PhotoSwipe.detatch(photoSwipeInstance);
                }
                
                return true;
                
            });
        
    });

}(window, window.jQuery, window.Code.PhotoSwipe));



   // this is run with every page loaded - may be cached though?
    $(document).bind('pageinit', function(e, data) {
        console.log("- pageinit -");
        
        // we need to clear the fiter 
        $('#filter-clear-button').click(function(){
             
             var newArray = [];
             setCookie(statesCookieName,newArray.join(),365);
             document.location.reload();
             
         });
    
    });
    
    // This is called when moving between pages first with the
    // uri then with the fragment of dom that is about to be displayed.
    $(document).bind( "pagebeforechange", function( e, data ) {

        //console.log("- pagebeforechange -");
        //console.log(data.toPage);
        
        if( typeof data.toPage !== "string"  ){
            
            // at this point the page has been loaded into the dom and we are
            // about to switch it to visible - change it now if we need to!
            console.log("about to show " + data.toPage.attr("id"));
            var parts = data.toPage.attr("id").split('-');
            var pageType =  parts[0];
         
            // switch statement to call the page update functions...
            switch(pageType){
                case 'score':
                    initScorePage( data.toPage.attr("id") );
                    break;
                case 'filter':
                    initFilterPage( data.toPage.attr("id") );
                    break;
                case 'species':
                    initSpeciesListPage( data.toPage.attr("id") );
                    break;
                default:
                    console.log("No init method for " + data.toPage.attr("id"));
            }
            
        
        }
        
        
    });

   // Called after the page has become visible.
    $(document).bind( "pagechange", function( e, data ) {
        
        // this ensures the check boxes on the score pages are updated
        // could perhaps be run only with score pages for efficiency 
        // but no harm in making sure all checkboxes are up to date!
        $("input[type='checkbox']").checkboxradio("refresh");
        
        
    });


    /*
        Init the score page so by popul
    */
    function initScorePage(pageId){
        
        console.log("Init: " + pageId);
        
        var inputSelector = "#" + pageId + " .stateCheck";
        
        // make sure we have a cookie of some kind for the states
        if(getCookie(statesCookieName) == null){
            setCookie(statesCookieName, '' , 365);
        }else{
            var currentStates = getCookie(statesCookieName).split(',');
        }
        
        console.log(currentStates);
        
        // set the check boxes as per the values in the cookie
         $(inputSelector).each(function(index, input){
             
             for(var i = 0; i < currentStates.length; i++){
                 
                 if(currentStates[i] == input.value){
                     input.checked = true;
                     return;
                 }
             }
             
             // otherwise they are not checked
             input.checked = false;
         });
        
        
        //listen to clicking and unclicking of checkboxes
        $(inputSelector).change(function(e){
            
            var currentStates = getCookie(statesCookieName).split(',');
            var changedState = e.currentTarget.value
            
            if(e.currentTarget.checked){
                
                console.log("Add " + changedState); 
                currentStates[currentStates.length] = e.currentTarget.value;
                setCookie(statesCookieName,currentStates.join(),365);
                
            }else{
                console.log("Remove " + changedState);
                var newArray = [];
                for(var i = 0; i < currentStates.length; i++){
                    if(currentStates[i] != changedState) newArray[newArray.length] = currentStates[i];
                }
                setCookie(statesCookieName,newArray.join(),365);
                
            }
                       
        });
        
    }
    
    
    function initFilterPage( pageId ){

        
        
        var statesCookieName = 'mobile_guide_states';
        var currentStates = getCookie(statesCookieName).split(',');
        
        console.log(currentStates);
        
        // we update the page in response to getting
        // the
        
        $(".filterState").each(function(index, span){

            $('#' + span.id).css('display', 'none');
      
            for(var i = 0; i < currentStates.length; i++){
              
              if('filterState-' + currentStates[i] == span.id){
                  $('#' + span.id).css('display', 'inline');
                  return;
              }
              
            }
                      
        });


    }
    
    
    function initSpeciesListPage( pageId ){
        
        // we need the current states
        var statesCookieName = 'mobile_guide_states';
        var currentStates = getCookie(statesCookieName).split(',');
        
        // set the score to - while we load the new ones
        $('#species-page .ui-li-count').html('Score: - ');
        
        var scoreMatrix = [];
        
        // call the ajax for a list of all scores
        $.getJSON('js/scores_data.js', function(data) {
         
          // work through the items in the
          var currentSpecies = null;
          $.each(data, function(index, row){
            
            // make sure we are on the right species
            // they are sorted so come in blocks
            if (currentSpecies == null || currentSpecies.speciesId != row.species_id){
                currentSpecies = {speciesId:row.species_id, score:0};
                scoreMatrix[currentSpecies.speciesId] = currentSpecies;
            }
                        
            // is this state one of the ones that has been selected
            for(var i = 0; i < currentStates.length; i++){
                if(row.state_id == currentStates[i]){
                    currentSpecies.score = currentSpecies.score + 1;
                    break;
                }
            }  
          });
          
          // we now have a matrix of species scores
          // let's update the display
           $('#species-page .ui-li-count').each(function(index, span){
               
               var spanId =  span.id.substring(14);
               currentSpecies = scoreMatrix[spanId];
               
               if(spanId in scoreMatrix){
                   span.innerHTML = 'Score: ' + currentSpecies.score;
                   
                   $('#'+span.id).data('score', currentSpecies.score);
                   
               }else{
                   span.innerHTML = 'Score: 0';
                   $('#'+span.id).data('score', 0);
                    
               }
               
            });
            
            // now sort the list as per instructions..
            var mylist = $('#species-page ul');
            var listitems = mylist.children('li').get();
            listitems.sort(function(a, b) {
                
               var elementA = $(a).find('.ui-li-count');
               var scoreA = elementA.data('score');
               
               var elementB = $(b).find('.ui-li-count');
               var scoreB = elementB.data('score');
               
               if(scoreA == scoreB) return 0;
               if(scoreA > scoreB) return -1;
               if(scoreA < scoreB) return 1;
            
            })
            //$('#species-page ul').empty();
            $.each(listitems, function(idx, itm) { 
                mylist.append(itm);
               
            });
            
            

          
        });
        
        
       
    }

    
    /*
        ************ Utility Methods *************
        * The cookie methods actually uses local storage *
    */
    
    function setCookie(name,value,exdays)
    {
        localStorage.setItem(name, value);
    }

    function getCookie(name){
        
        var value = localStorage.getItem(name);
        if (value == null){
            value = '';
        }
        return value;
    }

    function deleteCookie(name) {
        localStorage.removeItem(name);
    }    
    
    /*
    function setCookie(c_name,value,exdays)
    {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
    }

    function getCookie(c_name){
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++)
    {
      x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
      y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
      x=x.replace(/^\s+|\s+$/g,"");
      if (x==c_name)
        {
        return unescape(y);
        }
      }
     return '';
    }

    function deleteCookie(name) {
        setCookie(name,"",-1);
    }
*/