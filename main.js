window.onload = function () {

  /* =============================================== Aljory =============================================== */
  // Custom alert
function showAlert(message, titleText, onOk) {
  var popup   = document.getElementById("custom-popup");
  var text    = document.getElementById("popup-message");
  var title   = document.getElementById("popup-title");
  var okBtn   = document.getElementById("popup-ok");
  var cancelBtn = document.getElementById("popup-cancel");

  // عنوان افتراضي "تنبيه" إذا لم يُرسل عنوان
  if (!titleText) {
    titleText = "تنبيه";
  }

  title.innerHTML = titleText;
  text.innerHTML  = message;

  // تنبيه عادي: زر واحد فقط
  cancelBtn.style.display = "none";
  okBtn.innerHTML = "موافق";

  // إظهار النافذة
  popup.className = "custom-popup";

  okBtn.onclick = function () {
    // إخفاء النافذة
    popup.className = "popup-hidden";

    // إذا تم إرسال دالة تُنفَّذ بعد الضغط على موافق
    if (onOk) {
      onOk();
    }
  };
}



  // Custom confirm 
function showConfirm(message, okText, cancelText, callback) {
  var popup   = document.getElementById("custom-popup");
  var text    = document.getElementById("popup-message");
  var title   = document.getElementById("popup-title");
  var okBtn   = document.getElementById("popup-ok");
  var cancelBtn = document.getElementById("popup-cancel");

  title.innerHTML = "تأكيد";
  text.innerHTML  = message;

  okBtn.innerHTML     = okText     || "موافق";
  cancelBtn.innerHTML = cancelText || "إلغاء";
  cancelBtn.style.display = "inline-block";

  // إظهار النافذة
  popup.className = "custom-popup";

  okBtn.onclick = function () {
    popup.className = "popup-hidden";
    if (callback) {
      callback(true);
    }
  };

  cancelBtn.onclick = function () {
    popup.className = "popup-hidden";
    if (callback) {
      callback(false);
    }
  };
}


  /* ======================= REQUEST A SERVICE PAGE (request.html) ======================= */
  var serviceSelect = document.getElementById("serviceSelect");
  var customerName  = document.getElementById("customerName");
  var dueDateInput  = document.getElementById("dueDate");
  var requestDesc   = document.getElementById("requestDesc");

  if (serviceSelect && customerName && dueDateInput && requestDesc) {
    var requestForm       = serviceSelect.form;
    var requestsContainer = null;

    requestForm.onsubmit = function (evt) {
      if (evt && evt.preventDefault) {
        evt.preventDefault();
      }

      var errors = [];
      var i;

      // 1) service selected
      if (!serviceSelect.value) {
        errors.push("يجب اختيار خدمة من القائمة.");
      }

      // 2) full name, no numbers / ? ! @
      var nameValue  = customerName.value;
      var hasSpace   = nameValue.indexOf(" ") !== -1;
      var invalidSet = "0123456789?!@";
      var hasInvalid = false;
      for (i = 0; i < nameValue.length; i++) {
        if (invalidSet.indexOf(nameValue.charAt(i)) !== -1) {
          hasInvalid = true;
          break;
        }
      }
      if (!hasSpace) {
        errors.push("الرجاء كتابة الاسم الكامل (اسمك واسم العائلة على الأقل).");
      }
      if (hasInvalid) {
        errors.push("الاسم لا يجب أن يحتوي على أرقام أو الرموز: ? ! @ .");
      }

      // 3) due date at least 3 days later
      var dateValue = dueDateInput.value;
      if (!dateValue) {
        errors.push("يجب اختيار تاريخ للطلب.");
      } else {
        var today = new Date();
        today.setHours(0, 0, 0, 0);

        var dueDate = new Date(dateValue);
        dueDate.setHours(0, 0, 0, 0);

        var minDate = new Date(today.getTime());
        minDate.setDate(minDate.getDate() + 3);

        if (dueDate < minDate) {
          errors.push("التاريخ قريب جداً. الرجاء اختيار موعد بعد 3 أيام على الأقل.");
        }
      }

      // 4) description >= 100 chars
      var descValue = requestDesc.value;
      if (descValue.length < 100) {
        errors.push("وصف الطلب قصير جداً. الرجاء كتابة 100 حرف على الأقل.");
      }

      // show nicely formatted errors
      if (errors.length > 0) {
        var msg = "لم يتم إرسال الطلب بسبب الأخطاء التالية:<br><br>";
        for (i = 0; i < errors.length; i++) {
          msg += "• " + errors[i] + "<br>";
        }
        showAlert(msg);
        return false;
      }

      // collect info
      var selectedText = "";
      if (serviceSelect.selectedIndex >= 0) {
        selectedText = serviceSelect.options[serviceSelect.selectedIndex].text;
      }
      var requestInfo = {
        service: selectedText,
        name: customerName.value,
        date: dueDateInput.value,
        description: requestDesc.value
      };

      // confirmation with custom button labels
      showConfirm(
        "تم إرسال طلبك بنجاح.<br><br>" +
        "هل تريد البقاء في صفحة طلب الخدمة لإضافة طلب آخر؟",
        "البقاء في الصفحة",
        "العودة للوحة العميل",
        function (stayOnPage) {
          if (stayOnPage) {
            // stay + show added requests
            if (!requestsContainer) {
              requestsContainer           = document.createElement("section");
              requestsContainer.className = "card";
              requestsContainer.id        = "addedRequests";

              var title = document.createElement("h2");
              title.appendChild(
                document.createTextNode("الطلبات التي أضفتها في هذه الجلسة")
              );
              requestsContainer.appendChild(title);

              var list = document.createElement("div");
              list.id  = "addedRequestsList";
              requestsContainer.appendChild(list);

              var cardSection = requestForm.parentNode;
              cardSection.parentNode.insertBefore(
                requestsContainer,
                cardSection.nextSibling
              );
            }

            var listDiv = document.getElementById("addedRequestsList");
            if (listDiv) {
              var item = document.createElement("div");
              item.style.borderTop  = "1px solid #eee";
              item.style.marginTop  = "10px";
              item.style.paddingTop = "10px";
              item.style.textAlign  = "right";

              var line1 = document.createElement("p");
              line1.appendChild(
                document.createTextNode(
                  "الخدمة: " + requestInfo.service + " | العميل: " + requestInfo.name
                )
              );

              var line2 = document.createElement("p");
              line2.appendChild(
                document.createTextNode("التاريخ: " + requestInfo.date)
              );

              var line3 = document.createElement("p");
              line3.appendChild(
                document.createTextNode("الوصف: " + requestInfo.description)
              );

              item.appendChild(line1);
              item.appendChild(line2);
              item.appendChild(line3);

              listDiv.appendChild(item);
            }

            requestForm.reset();  // ready for another request
          } else {
            window.location.href = "client.html";
          }
        }
      );

      return false;
    };
  }


  /* ======================= SERVICE EVALUATION PAGE (evaluate.html) ======================= */
  var prevServiceSelect = document.getElementById("prevService");
  var feedbackTextarea  = document.getElementById("feedback");
  var ratingInputs      = document.getElementsByName("rating");

  if (prevServiceSelect && feedbackTextarea && ratingInputs && ratingInputs.length > 0) {
    var evalForm = prevServiceSelect.form;

    evalForm.onsubmit = function (evt) {
      if (evt && evt.preventDefault) {
        evt.preventDefault();
      }

      var errors = [];
      var i;

      if (!prevServiceSelect.value) {
        errors.push("يرجى اختيار الخدمة التي تريد تقييمها.");
      }

      var ratingValue = "";
      for (i = 0; i < ratingInputs.length; i++) {
        if (ratingInputs[i].checked) {
          ratingValue = ratingInputs[i].value;
          break;
        }
      }
      if (ratingValue === "") {
        errors.push("يرجى اختيار عدد النجوم (التقييم).");
      }

      var feedbackText = feedbackTextarea.value;
      if (feedbackText === "") {
        errors.push("يرجى كتابة ملاحظاتك عن الخدمة.");
      }

      if (errors.length > 0) {
        var msg2 = "لم يتم إرسال التقييم بسبب:<br><br>";
        for (i = 0; i < errors.length; i++) {
          msg2 += "• " + errors[i] + "<br>";
        }
        showAlert(msg2);
        return false;
      }
var ratingNumber = parseInt(ratingValue, 10);
var msg, title;

if (ratingNumber >= 4) {
  title = "شكرًا لتقييمك";
  msg   = "شكرًا لتقييمك الجميل! يسعدنا أنك استمتعت بخدمتنا.";
} else {
  title = "نعتذر عن التجربة";
  msg   = "شكرًا لمشاركتك رأيك. نعتذر إن لم تكن التجربة بالمستوى المطلوب وسنسعى لتحسين خدماتنا.";
}

showAlert(msg, title, function () {
  window.location.href = "client.html";
});

      return false;
    };
  }


  /* ======================= CANCEL REQUEST PAGE (cancel.html) ======================= */
  var cancelReasonSelect = document.getElementById("cancelReason");
  var cancelOrderSelect  = document.getElementById("orderId");
  var cancelNotes        = document.getElementById("additionalNotes");

  if (cancelReasonSelect && cancelOrderSelect && cancelNotes) {
    var cancelForm = cancelReasonSelect.form;

    cancelReasonSelect.onchange = function () {
      if (cancelReasonSelect.value === "other") {
        cancelNotes.placeholder = "يرجى توضيح سبب الإلغاء هنا...";
      } else {
        cancelNotes.placeholder = "اكتب أي تفاصيل إضافية هنا (اختياري)";
      }
    };

    cancelForm.onsubmit = function (evt) {
      if (evt && evt.preventDefault) {
        evt.preventDefault();
      }

      var errors = [];
      var i, ch;

      if (!cancelReasonSelect.value) {
        errors.push("يرجى اختيار سبب الإلغاء.");
      }

      if (cancelReasonSelect.value === "other") {
        var notesText   = cancelNotes.value;
        var hasNonSpace = false;
        for (i = 0; i < notesText.length; i++) {
          ch = notesText.charAt(i);
          if (ch !== " " && ch !== "\n" && ch !== "\t") {
            hasNonSpace = true;
            break;
          }
        }
        if (!hasNonSpace) {
          errors.push("عند اختيار (سبب آخر) يجب كتابة الملاحظات الإضافية.");
        }
      }

      if (errors.length > 0) {
        var msg3 = "لم يتم تأكيد الإلغاء بسبب:<br><br>";
        for (i = 0; i < errors.length; i++) {
          msg3 += "• " + errors[i] + "<br>";
        }
        showAlert(msg3);
        return false;
      }

      showConfirm(
        "تم استلام طلب إلغاء الخدمة.<br><br>ستتم إعادتك الآن إلى لوحة العميل.",
        "متابعة",
        "البقاء في الصفحة",
        function (ok) {
          if (ok) {
            window.location.href = "client.html";
          }
        }
      );

      return false;
    };
  }

  /* =============================================== Aljory =============================================== */
  
};

