jQuery(document).on("click", ".changeOrderStatus", function() {
  var rowId = jQuery(this)
    .closest("tr")
    .attr("id");
  var orderStatus = [
    "Pending",
    "Confirmed",
    "Dispatched",
    "Cancelled",
    "out of delivery",
    "Completed",
    "Rejected"
  ];
  var orderStCls = [
    "danger",
    "success",
    "danger",
    "danger",
    "success",
    "success",
    "danger"
  ];
  jQuery.ajax({
    type: "PUT",
    url: baseUrl + "/orders/update/" + jQuery(this).attr("rel"),
    data: { status: parseInt(jQuery(this).val()) },
    success: function(data) {
      jQuery("#" + rowId)
        .children("td:nth(4)")
        .html("");
      jQuery("#" + rowId)
        .children("td:nth(4)")
        .html(
          '<span class="badge badge-' +
            orderStCls[data.status] +
            ' ">' +
            orderStatus[data.status] +
            "</span>"
        );
    }
  });
});
