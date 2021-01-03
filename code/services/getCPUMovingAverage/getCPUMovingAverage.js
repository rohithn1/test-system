/**
 * Type: Stream Service
 * Description: A service that does not have an execution timeout which allows for infinite execution of logic.
 * @param {CbServer.BasicReq} req
 * @param {string} req.systemKey
 * @param {string} req.systemSecret
 * @param {string} req.userEmail
 * @param {string} req.userid
 * @param {string} req.userToken
 * @param {boolean} req.isLogging
 * @param {[id: string]} req.params
 * @param {CbServer.Resp} resp
 */

function getCPUMovingAverage(req, resp) {
  ClearBlade.init({ request: req });
  var messaging = ClearBlade.Messaging();

  var query = ClearBlade.Query({collectionName: "cpu_usage_percentages"});
  var interval = function () {
    var callback = function (err, data) {
      if (err) {
        messaging.publish("error", "There was an error: " + data);
        res.error(err);
      } else {
        messaging.publish("analytics", "Percentage CPU Usage as Moving Average: " + movingAverage(data).toFixed(6));
      }
    }
    query.descending("timestamp")
         .setPage(5,0)
         .fetch(callback);

    // Examples of process message tasks:
    // - Storing message in a collection: https://github.com/ClearBlade/native-libraries/blob/master/clearblade.md#collectioncreatenewitem-callback
    // - Process and publish to another topic: https://github.com/ClearBlade/native-libraries/blob/master/clearblade.md#messagepublishtopic-payload
    // - Update a Device State: https://github.com/ClearBlade/native-libraries/blob/master/clearblade.md#deviceupdatequery-changes-callback
  }
  setInterval(interval , 5000);
  
  function movingAverage(data) {
    var mean = (data.DATA[0].usagepercentage + data.DATA[1].usagepercentage + data.DATA[2].usagepercentage + data.DATA[3].usagepercentage + data.DATA[4].usagepercentage)/5;
    return mean;
  }
}
