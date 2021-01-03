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

function getCPUAnalytics(req, resp) {
  ClearBlade.init({ request: req });
  var messaging = ClearBlade.Messaging();

  var collection = ClearBlade.Collection({collectionName: "cpu_usage_percentages"});

  const TOPIC = "rohith-mac/1/cpu-raw";
  messaging.subscribe(TOPIC, WaitLoop);

  function WaitLoop(err, data) {
    if (err) {
      // DEBUG MESSAGE
      messaging.publish("error", "Subscribe failed: " + data);
      resp.error(data);
    }
    // DEBUG MESSAGE
    messaging.publish("success", "Subscribed to Shared Topic. Starting Loop.");

    while (true) {
      messaging.waitForMessage([TOPIC], function(err, msg, topic) {
        if (err) {
          // DEBUG MESSAGE
          messaging.publish("error", "Failed to wait for message: " + err + " " + msg + "  " + topic);
          resp.error("Failed to wait for message: " + err + " " + msg + "    " + topic);
        } 
        processMessage(msg, topic);
      });
    }
  }

  function processMessage(msg, topic) {
    // DEBUG MESSAGE
    messaging.publish("processedmessage", "Received message " +msg+ " "+ topic);
    collection.create({timestamp: new Date(), usagepercentage: parseFloat(msg)});
    // Examples of process message tasks:
    // - Storing message in a collection: https://github.com/ClearBlade/native-libraries/blob/master/clearblade.md#collectioncreatenewitem-callback
    // - Process and publish to another topic: https://github.com/ClearBlade/native-libraries/blob/master/clearblade.md#messagepublishtopic-payload
    // - Update a Device State: https://github.com/ClearBlade/native-libraries/blob/master/clearblade.md#deviceupdatequery-changes-callback
  }
}
