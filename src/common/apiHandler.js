ApiHandler = function (url) {
  var self = this;
  
  self.url = url;
  
  function apiRequest (route) {
    var request = d3.xhr(self.url+"/"+route);
    //request.header("Content-type","application/x-www-form-urlencoded");
    request.header('Content-Type', 'application/json');
    return request;
  }
  
  this.offersExercised = function (params, load, error) {
    var request = apiRequest("offersExercised");

    request.post(JSON.stringify(params))
      .on('load', function(xhr){
        var response = JSON.parse(xhr.response), data = [];   

        if (response.length>1) {
          if (params.reduce===false) {
            data = response.map(function(d) {
              d = JSON.parse(d);
              return {
                id     : d.id,
                time   : moment.utc(d.key.slice(2)),
                amount : d.value[1],
                price  : d.value[2],        
                type   : ''
              }
            });
            
            var prev = null;
            for (var i=data.length; i>-1; i--) {
              if (prev && prev.price>data[i].price)      data[i].type = 'bid';
              else if (prev && prev.price<data[i].price) data[i].type = 'ask';
              else if (prev)                             data[i].type = prev.type;
              prev = data[i];
            }
            
                     
          } else {
            response.splice(0,1); //remove first   
            
            //remove null row, if we get one 
            if (response.length==1 && !response[0][1]) response.shift();
            
            data = response.map(function(d) {
              return {
                time    : moment.utc(d[0]),
                open    : d[4],
                close   : d[5],
                high    : d[6],
                low     : d[7],
                vwap    : d[8],
                volume  : d[1],
                num     : d[3],
                volume2 : d[2]
              };
            });
          }
        }
        
        load(data);
      })
      .on('error', function(xhr){
        console.log(xhr.response);
        error({status:xhr.status,text:xhr.statusText,message:xhr.response})
      });
      
    return request;    
  } 
  
  this.issuerCapitalization = function (params, load, error) {
    
    var request = apiRequest("gatewayCapitalization");
/*  
    params = {
      pairs : [{
      currency: 'USD',
      issuer:"rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"  
      }],
    
      startTime : moment.utc().subtract("minutes",1),
      endTime : moment.utc(),
      timeIncrement : "minutes" 
    }
*/        
        
    request.post(JSON.stringify(params))
      .on('load', function(xhr) {
        var response = JSON.parse(xhr.response);  
        console.log(response); 
        load(response);
      })
      .on('error', function(xhr){
        console.log(xhr.response);
        error({status:xhr.status,text:xhr.statusText,message:xhr.response})
      });
      
    return request;        
  }
  
  this.getTotalAccounts = function(time, callback){
    var request = apiRequest("accountsCreated");
    time = time || new Date();
    
    request.post(JSON.stringify({
      startTime     : time,  
      endTime       : d3.time.year.offset(time, -10),
      timeIncrement : "all"
      
    })).on('load', function(xhr){   
      data  = JSON.parse(xhr.response);
      num   = data[1] && data[1][1] ? data[1][1] : 0;
      callback (num);
    }).on('error', function(xhr){
      console.log(xhr.response);
      callback(null);
    }); 
    
    return request;
  }
  
  this.accountsCreated = function (params, callback, err) {
    var request = apiRequest("accountsCreated");
    request.post(JSON.stringify(params))
    .on('load', function(xhr){   
      callback(JSON.parse(xhr.response));
      
    }).on('error', function(xhr){
      console.log(xhr.response);
      error({status:xhr.status,text:xhr.statusText,message:xhr.response});
    });
    
    return request;
  }
  
  this.getTopMarkets = function (callback, err) {
    var request = apiRequest("topMarkets");

    request.post("")
    .on('load', function(xhr){   
      var response = JSON.parse(xhr.response);
      response.splice(0,1); //remove first  
      callback(response);
      
    }).on('error', function(xhr){
      console.log(xhr.response);
      error({status:xhr.status,text:xhr.statusText,message:xhr.response});
    });    
  }
}