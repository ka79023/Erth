 
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

/* ======================================================================================================================================== 
   ======================================================================================================================================== */

window.onload = function () {
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

// mark a single field in red and remove red when user edits
function markFieldError(element) {
  if (!element) return;

  element.classList.add("input-error");

  if (!element._hasErrorHandler) {
    var clear = function () {
      element.classList.remove("input-error");
    };

    var tag = element.tagName.toLowerCase();
    if (tag === "select") {
      element.onchange = clear;
    } else {
      element.oninput = clear;
    }

    element._hasErrorHandler = true;
  }
}

// for rating stars
function markRatingError(ratingInputs) {
  var container = document.querySelector(".rating-stars") ||
                  document.querySelector(".stars");

  if (container) {
    container.classList.add("rating-error");

    if (!container._hasRatingHandler) {
      for (var i = 0; i < ratingInputs.length; i++) {
        ratingInputs[i].onchange = function () {
          container.classList.remove("rating-error");
        };
      }
      container._hasRatingHandler = true;
    }
  }
}

if (prevServiceSelect && feedbackTextarea && ratingInputs && ratingInputs.length > 0) {
  var evalForm = prevServiceSelect.form;

  evalForm.onsubmit = function (evt) {
    if (evt && evt.preventDefault) {
      evt.preventDefault();
    }

    var errors = [];
    var i;

    // 1) must select a service
    if (prevServiceSelect.value === "" || prevServiceSelect.value === null) {
      errors.push("يرجى اختيار الخدمة التي تريد تقييمها.");
      markFieldError(prevServiceSelect);
    }

    // 2) must choose rating (one radio checked)
    var ratingValue = "";
    for (i = 0; i < ratingInputs.length; i++) {
      if (ratingInputs[i].checked) {
        ratingValue = ratingInputs[i].value;
        break;
      }
    }
    if (ratingValue === "") {
      errors.push("يرجى اختيار عدد النجوم (التقييم).");
      markRatingError(ratingInputs);
    }

    // 3) feedback text not empty
    var feedbackText = feedbackTextarea.value;
    if (feedbackText === "") {
      errors.push("يرجى كتابة ملاحظاتك عن الخدمة.");
      markFieldError(feedbackTextarea);
    }

    // Show errors if any
    if (errors.length > 0) {
      var msg = "لم يتم إرسال التقييم بسبب:<br><br>";
      for (i = 0; i < errors.length; i++) {
        msg += "• " + errors[i] + "<br>";
      }
      showAlert(msg, "تنبيه");
      return false;
    }

    // If valid: show thank-you or apology depending on rating
    var ratingNumber = parseInt(ratingValue, 10);
    var title, message;

    if (ratingNumber >= 4) {
      title = "شكراً لتقييمك";
      message = "شكرًا لتقييمك الجميل! يسعدنا أنك استمتعت بخدمتنا.";
    } else {
      title = "نعتذر عن التجربة";
      message = "شكرًا لمشاركتك رأيك.<br> نأسف إن لم تكن التجربة بالمستوى المطلوب وسنعمل على تحسين خدماتنا.";
    }
	

    // showAlert with callback → then go back to dashboard
    showAlert(message, title, function () {
      window.location.href = "client.html";
    });

    return false;
  };
} 
  /* ======================= CANCEL REQUEST PAGE (cancel.html) ======================= */
var cancelReasonSelect = document.getElementById("cancelReason");
var cancelOrderSelect  = document.getElementById("orderId");
var cancelNotes        = document.getElementById("additionalNotes");

// Only run this if we are on the cancel page
if (cancelReasonSelect && cancelOrderSelect && cancelNotes) {
  var cancelForm = cancelReasonSelect.form;

  // Change placeholder when "سبب آخر" is chosen 
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

    // سبب الإلغاء
    if (cancelReasonSelect.value === "" || cancelReasonSelect.value === null) {
      errors.push("يرجى اختيار سبب الإلغاء.");
    }

    // إذا السبب = "سبب آخر" → الملاحظات إجبارية (نص غير فارغ)
    if (cancelReasonSelect.value === "other") {
      var notesText = cancelNotes.value;
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
      var msg = "لم يتم تأكيد الإلغاء بسبب:<br><br>";
      for (i = 0; i < errors.length; i++) {
        msg += "- " + errors[i] + "<br>";
      }
      showAlert(msg, "خطأ في الإلغاء");
      return false;
    }

    var confirmMsg =
      "تم استلام طلب إلغاء الخدمة.<br><br>" +
      "هل ترغب في المتابعة وإلغاء هذا الطلب والعودة إلى لوحة العميل؟";

    showConfirm(confirmMsg, "تأكيد الإلغاء", "رجوع", function (ok) {
      if (ok) {
        var orderId = cancelOrderSelect.value;

        if (orderId) {
          try {
            var existing = localStorage.getItem("canceledOrderIds");
            if (!existing || existing === "") {
              localStorage.setItem("canceledOrderIds", orderId);
            } else {
              var list = existing.split(",");
              var found = false;
              for (var k = 0; k < list.length; k++) {
                if (list[k] === orderId) {
                  found = true;
                  break;
                }
              }
              if (!found) {
                existing = existing + "," + orderId;
                localStorage.setItem("canceledOrderIds", existing);
              }
            }
          } catch (e) {
          }
        }
		
		localStorage.setItem("showCancelMessage", "yes");

        window.location.href = "client.html";
      }

    });

    return false;
  };
}
/* ===================== CLIENT DASHBOARD (client.html) ===================== */
(function () {
  var body = document.body;

  if (!body ||
      body.className.indexOf("page-client") === -1 ||
      body.className.indexOf("page-cancel") !== -1) {
    return;
  }

  var canceledIdsString = null;

  try {
    canceledIdsString = localStorage.getItem("canceledOrderIds");
  } catch (e) {
    canceledIdsString = null;
  }

  var canceledIds = [];

  if (canceledIdsString && canceledIdsString !== "") {
    canceledIds = canceledIdsString.split(",");
  }

  if (canceledIds.length === 0) {
    return; 
  }

  var rows = document.querySelectorAll(".requests-table tbody tr");
  var anyFound = false;

  for (var i = 0; i < canceledIds.length; i++) {
    var id = canceledIds[i];

    for (var r = 0; r < rows.length; r++) {
      if (rows[r].getAttribute("data-order-id") === id) {
        anyFound = true;

        var cells       = rows[r].getElementsByTagName("td");
        var statusCell  = cells[3]; 
        var actionsCell = cells[4]; 

        var badge = statusCell.querySelector(".status-badge");
        if (badge) {
          badge.className = "status-badge status-cancelled";
          badge.innerHTML = "ملغي";
        }

        actionsCell.innerHTML = "تم إلغاء الطلب";
        actionsCell.className = "cancelled-action";
      }
    }
  }

  // نعرض رسالة الإلغاء مرة واحدة فقط
  var showMsgOnce = null;
  try {
    showMsgOnce = localStorage.getItem("showCancelMessage");
  } catch (e) {
    showMsgOnce = null;
  }

  if (anyFound && showMsgOnce === "yes") {
    var msg = "تم إلغاء طلبك بنجاح.<br>يمكنك دائمًا حجز خدمة جديدة من لوحة العميل.";
    showAlert(msg, "تم الإلغاء");

    try {
      localStorage.removeItem("showCancelMessage");
    } catch (e) {}
  }
})();

  /* =============================================== Aljory End =============================================== */
  
  
  	    /* =============================================== Leena =============================================== */


  /* ======================= services PAGE (services.html) ======================= */


  var sortSelect = document.getElementById("Leena-sort-by");
  
  if (sortSelect) {

    // Show services in random order when the page loads
    shuffleServices();
    
    // Sort again when the user changes the option
    sortSelect.onchange = function () {
      sortServices(this.value);
    };
  }

  function shuffleServices() {
    var container = document.querySelector(".Leena-container");
    var cards = document.querySelectorAll(".Leena-card");
    
    var cardsArray = Array.prototype.slice.call(cards);
	
    // Random shuffle
    for (var i = cardsArray.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      container.appendChild(cardsArray[j]);
    }
  }
  
  // Sort services based on the selected type
  function sortServices(sortType) {
    var container = document.querySelector(".Leena-container");
    var cards = document.querySelectorAll(".Leena-card");
    var cardsArray = Array.prototype.slice.call(cards);
	
    // Switch for the different sort options
    switch(sortType) {
      case "name-asc":
        cardsArray.sort(function(a, b) {
          var titleA = a.querySelector(".Leena-service-title").textContent;
          var titleB = b.querySelector(".Leena-service-title").textContent;
          return titleA.localeCompare(titleB, "ar"); 
        });
        break;
        
      case "name-desc":
        cardsArray.sort(function(a, b) {
          var titleA = a.querySelector(".Leena-service-title").textContent;
          var titleB = b.querySelector(".Leena-service-title").textContent;
          return titleB.localeCompare(titleA, "ar");
        });
        break;
        
      case "price-asc":
        cardsArray.sort(function(a, b) {
          var priceA = extractPrice(a.querySelector(".Leena-service-price").textContent);
          var priceB = extractPrice(b.querySelector(".Leena-service-price").textContent);
          return priceA - priceB;
        });
        break;
        
      case "price-desc":
        cardsArray.sort(function(a, b) {
          var priceA = extractPrice(a.querySelector(".Leena-service-price").textContent);
          var priceB = extractPrice(b.querySelector(".Leena-service-price").textContent);
          return priceB - priceA;
        });
        break;
        
      case "default":
        cardsArray.sort(function(a, b) {
          var allCards = document.querySelectorAll(".Leena-card");
          var indexA = Array.prototype.indexOf.call(allCards, a);
          var indexB = Array.prototype.indexOf.call(allCards, b);
          return indexA - indexB;
        });
        break;
    }
    
    // Apply the new order
    cardsArray.forEach(function(card) {
      container.appendChild(card);
    });
  }
  
  // Extract price from text
  function extractPrice(priceText) {
    var match = priceText.match(/(\d+)/); 
    return match ? parseInt(match[1]) : 0;
  }

    /* =============================================== Leena End =============================================== */


    /* =============================================== Khadija =============================================== */

  function updateClock() {
  const el = document.getElementById("clock");
  if (!el) return;

  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  let s = now.getSeconds();

  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  s = s < 10 ? "0" + s : s;

  el.textContent = `${h}:${m}:${s}`;
}

setInterval(updateClock, 1000);
updateClock();

const backToTopBtn = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopBtn.style.display = "flex";
  } else {
    backToTopBtn.style.display = "none";
  }
});

backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

};
document.addEventListener("DOMContentLoaded", () => {

  let savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.classList.add("dark-theme");
  }

  const toggle = document.getElementById("themeToggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark-theme");

    const isDark = document.documentElement.classList.contains("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
});
      /* =============================================== Khadija End  =============================================== */


      
      /* =============================================== Lubna & Remas  =============================================== */

document.addEventListener('DOMContentLoaded', function () {
  remasInitAddServicePage();
  remasInitProviderDashboard();
  remasInitManageEmployees();
  LubnaInitJoinTeam();
});

function remasInitAddServicePage() {
  const remasForm = document.getElementById('remas-add-service-form');
  if (!remasForm) return;

  const remasNameInput  = document.getElementById('serviceName');
  const remasImgInput   = document.getElementById('serviceImg');
  const remasPriceInput = document.getElementById('price');
  const remasDescInput  = document.getElementById('serviceDesc');

  remasForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const remasName  = remasNameInput.value.trim();
    const remasPrice = remasPriceInput.value.trim();
    const remasDesc  = remasDescInput.value.trim();
    const remasImg   = remasImgInput.files[0];

    if (!remasName || !remasPrice || !remasDesc || !remasImg) {
      showAlert("الرجاء تعبئة جميع الحقول (الاسم، الصورة، السعر، الوصف).", "تنبيه");
      return;
    }

    if (/^[0-9]/.test(remasName)) {
      showAlert('حقل الاسم لا يمكن أن يبدأ برقم.', 'تنبيه');
      remasNameInput.focus();
      return;
    }

    const remasPriceNumber = Number(remasPrice);
    if (Number.isNaN(remasPriceNumber) || remasPriceNumber <= 0) {
      showAlert('حقل السعر يجب أن يكون رقمًا أكبر من صفر.', 'تنبيه');
      remasPriceInput.focus();
      return;
    }

    const remasService = {
      remasName: remasName,
      remasPrice: remasPriceNumber,
      remasDesc: remasDesc,
      remasImgName: remasImg.name
    };

    let remasServices = [];
    const remasStored = localStorage.getItem('remas-services');

    if (remasStored) {
      try {
        remasServices = JSON.parse(remasStored);
        if (!Array.isArray(remasServices)) {
          remasServices = [];
        }
      } catch (e) {
        remasServices = [];
      }
    }

    remasServices.push(remasService);
    localStorage.setItem('remas-services', JSON.stringify(remasServices));

    remasForm.reset();
    showAlert('تمت إضافة الخدمة بنجاح: ' + remasName, 'نجاح');
  });
}

function remasInitProviderDashboard() {
  const remasList = document.getElementById('remas-service-list');
  if (!remasList) return;

  remasList.innerHTML = '';

  let remasServices = [];
  const remasStored = localStorage.getItem('remas-services');

  if (remasStored) {
    try {
      remasServices = JSON.parse(remasStored);
      if (!Array.isArray(remasServices)) {
        remasServices = [];
      }
    } catch (e) {
      remasServices = [];
    }
  }

  if (remasServices.length === 0) {
    const remasEmptyItem = document.createElement('li');
    remasEmptyItem.textContent = 'لا توجد خدمات مضافة حتى الآن.';
    remasList.appendChild(remasEmptyItem);
    return;
  }

  remasServices.forEach(function (remasService) {
    const remasItem = document.createElement('li');

    const remasNameSpan = document.createElement('span');
    remasNameSpan.className = 'service-name';
    remasNameSpan.textContent =
      remasService.remasName + ' - ' + remasService.remasPrice + ' ريال';

    remasItem.appendChild(remasNameSpan);
    remasList.appendChild(remasItem);
  });
}

/* ===================== Remas: Manage Employees ===================== */

/* 1) Global array – will be filled from localStorage or defaults */
let remasMembers = [];

/* 2) Helpers to save/load from localStorage */
function remasSaveMembers() {
  try {
    localStorage.setItem("remasMembers", JSON.stringify(remasMembers));
  } catch (e) {
    // ignore if storage is blocked
  }
}

function remasLoadMembers() {
  try {
    var stored = localStorage.getItem("remasMembers");
    if (stored) {
      var parsed = JSON.parse(stored);
      if (parsed && parsed.length) {
        remasMembers = parsed;
        return;
      }
    }
  } catch (e) {
    // if JSON parse fails, fall back to defaults
  }

  // Default list (first time or if no valid stored data)
  remasMembers = [
    { remasId: '001', remasName: 'خالد النصيبي', remasRole: 'مرشد سياحي', remasDept: 'عسير' },
    { remasId: '002', remasName: 'لمى البريدي', remasRole: 'مدربة فنون', remasDept: 'نجد' },
    { remasId: '003', remasName: 'سلمان المطعني', remasRole: 'مختص زراعة', remasDept: 'الحجاز' },
    { remasId: '004', remasName: 'جميلة الدريس', remasRole: 'الحِرف اليدوية', remasDept: 'حياكة التراث' }
  ];

  remasSaveMembers();
}

/* 3) Render cards from remasMembers */
function remasRenderMembers(remasGridElement) {
  if (!remasGridElement) return;

  remasGridElement.innerHTML = '';

  if (remasMembers.length === 0) {
    const remasEmptyMsg = document.createElement('p');
    remasEmptyMsg.textContent = 'لا يوجد أعضاء في الفريق حالياً.';
    remasGridElement.appendChild(remasEmptyMsg);
    return;
  }

  remasMembers.forEach(function (remasMember) {
    const remasCard = document.createElement('div');
    remasCard.className = 'employee-card';

    const remasInfo = document.createElement('div');
    remasInfo.className = 'emp-info';

    const remasLabel = document.createElement('label');
    remasLabel.style.color = 'rgb(73, 42, 5)';

    const remasCheckbox = document.createElement('input');
    remasCheckbox.type = 'checkbox';
    remasCheckbox.name = 'deleteEmployee';
    remasCheckbox.setAttribute('data-remas-id', remasMember.remasId);

    const remasNameStrong = document.createElement('strong');
    remasNameStrong.textContent = 'الاسم: ' + remasMember.remasName;

    remasLabel.appendChild(remasCheckbox);
    remasLabel.appendChild(remasNameStrong);

    const remasIdP = document.createElement('p');
    remasIdP.innerHTML = '<strong>رقم الموظف:</strong> ' + remasMember.remasId;

    const remasRoleP = document.createElement('p');
    remasRoleP.innerHTML = '<strong>المسمى:</strong> ' + remasMember.remasRole;

    const remasDeptP = document.createElement('p');
    remasDeptP.innerHTML = '<strong>القسم:</strong> ' + remasMember.remasDept;

    remasInfo.appendChild(remasLabel);
    remasInfo.appendChild(remasIdP);
    remasInfo.appendChild(remasRoleP);
    remasInfo.appendChild(remasDeptP);

    const remasImg = document.createElement('img');
    remasImg.src = 'images/person.png';
    remasImg.alt = 'صورة الموظف';

    remasCard.appendChild(remasInfo);
    remasCard.appendChild(remasImg);

    remasGridElement.appendChild(remasCard);
  });
}

/* 4) Init function for the manage employees page */
function remasInitManageEmployees() {
  const remasGrid = document.getElementById('remas-employees-grid');
  if (!remasGrid) return;

  const remasDeleteBtn = document.getElementById('deleteAllBtn');
  const remasAddForm  = document.getElementById('remas-add-member-form');
  const remasEditBtn  = document.getElementById('editAllBtn');

  // Load from localStorage (or use default list)
  remasLoadMembers();

  // First render
  remasRenderMembers(remasGrid);

  /* -------- Delete selected members -------- */
  if (remasDeleteBtn) {
    remasDeleteBtn.addEventListener('click', function (event) {
      event.preventDefault();

      const remasChecked = remasGrid.querySelectorAll('input[name="deleteEmployee"]:checked');

      if (remasChecked.length === 0) {
        showAlert('يرجى اختيار أحد الموظفين للحذف', 'تنبيه');
        return;
      }

      // use custom confirm
      showConfirm(
        'هل أنت متأكد من رغبتك في حذف الموظفين المحددين؟',
        'حذف الأعضاء',
        'إلغاء',
        function (remasConfirm) {
          if (!remasConfirm) return;

          const remasIdsToDelete = Array.from(remasChecked).map(function (chk) {
            return chk.getAttribute('data-remas-id');
          });

          remasMembers = remasMembers.filter(function (member) {
            return !remasIdsToDelete.includes(member.remasId);
          });

          remasSaveMembers();
          remasRenderMembers(remasGrid);
        }
      );
    });
  }

  /* -------- Edit one selected member -------- */
  if (remasEditBtn) {
    remasEditBtn.addEventListener('click', function (event) {
      event.preventDefault();

      const remasChecked = remasGrid.querySelectorAll('input[name="deleteEmployee"]:checked');

      if (remasChecked.length === 0) {
        showAlert('يرجى اختيار أحد الموظفين للتعديل', 'تنبيه');
        return;
      }

      if (remasChecked.length > 1) {
        showAlert('يمكنك تعديل موظف واحد فقط في كل مرة', 'تنبيه');
        return;
      }

      const remasIdToEdit = remasChecked[0].getAttribute('data-remas-id');

      const remasMember = remasMembers.find(function (m) {
        return m.remasId === remasIdToEdit;
      });

      if (!remasMember) return;

      const newName = prompt('Enter new name for this member:', remasMember.remasName);
      if (!newName || newName.trim() === '') {
        showAlert('يجب تعبئة حقل الاسم', 'تنبيه');
        return;
      }

      remasMember.remasName = newName.trim();

      remasSaveMembers();
      remasRenderMembers(remasGrid);

      showAlert('تم تعديل اسم الموظف بنجاح', 'تم التحديث');
    });
  }

  /* -------- Add new member -------- */
  if (remasAddForm) {
    remasAddForm.addEventListener('submit', function (event) {
      event.preventDefault();

      const n      = document.getElementById('staffName');
      const i      = document.getElementById('stafID');
      const img    = document.getElementById('stafImg');
      const dob    = document.getElementById('staffDOB');
      const email  = document.getElementById('staffEmail');
      const tel    = document.getElementById('staffTele');
      const exp    = document.getElementById('staffExpertise');
      const deg    = document.getElementById('staffDeg');
      const skills = document.getElementById('staffSkills');
      const edu    = document.getElementById('staffEdu');

      const inputs = [n, i, dob, email, tel, exp, deg, skills, edu];

      // التحقق العام من الامتلاء
      const empty = inputs.find(function (inp) {
        return !inp || !inp.value || inp.value.trim() === '';
      });

      if (empty) {
        showAlert('الرجاء تعبئة جميع الحقول المطلوبة قبل الإضافة.', 'تنبيه');
        return;
      }

      // ===== التحقق من الاسم =====
      const nameVal = n.value.trim();

      if (!isNaN(nameVal.charAt(0))) {
        showAlert("يجب ألا يبدأ الاسم برقم.", 'تنبيه');
        return;
      }

      if (/\d/.test(nameVal)) {
        showAlert("يجب ألا يحتوي الاسم على أرقام.", 'تنبيه');
        return;
      }

      // ===== التحقق من الهوية =====
      const idVal = i.value.trim();
      if (!/^\d+$/.test(idVal)) {
        showAlert("هوية الموظف يجب أن تحتوي على أرقام فقط.", 'تنبيه');
        return;
      }

      // ===== التحقق من البريد الإلكتروني =====
      const emailVal = email.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(emailVal)) {
        showAlert("الرجاء إدخال بريد إلكتروني صحيح.", 'تنبيه');
        return;
      }

      // ===== التحقق من رقم الهاتف =====
      const telVal = tel.value.trim();

      if (!/^\d+$/.test(telVal)) {
        showAlert("رقم الهاتف يجب أن يحتوي على أرقام فقط.", 'تنبيه');
        return;
      }

      if (telVal.length < 9 || telVal.length > 12) {
        showAlert("رقم الهاتف غير صالح.", 'تنبيه');
        return;
      }

      // ===== التحقق من اختيار صورة =====
      if (!img.value) {
        showAlert("الرجاء اختيار صورة للموظف.", 'تنبيه');
        return;
      }

      // إذا كل شيء سليم → أضف الموظف
      const newMember = {
        remasId: idVal,
        remasName: nameVal,
        remasRole: exp.value.trim(),
        remasDept: 'عضو جديد'
      };

      remasMembers.push(newMember);
      remasSaveMembers();
      remasRenderMembers(remasGrid);

      showAlert('تمت إضافة العضو الجديد بنجاح: ' + newMember.remasName, 'نجاح');
      remasAddForm.reset();
    });
  }
}

/* ===================== Lubna Join Team ===================== */

function LubnaInitJoinTeam() {
  const LubnaForm = document.getElementById('lubna-joinTeamForm');
  if (!LubnaForm) return;

  LubnaForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const LubnaNameInput      = document.getElementById('memberName');
    const LubnaImgInput       = document.getElementById('memberImg');
    const LubnaDobInput       = document.getElementById('memberDOB');
    const LubnaEmailInput     = document.getElementById('memberEmail');
    const LubnaTeleInput      = document.getElementById('memberTele');
    const LubnaExpertiseInput = document.getElementById('memberExpertise');
    const LubnaSkillsInput    = document.getElementById('memberSkills');
    const LubnaEduInput       = document.getElementById('memberEdu');
    const LubnaMsgInput       = document.getElementById('memberMsg');

    const LubnaInputs = [
      LubnaNameInput,
      LubnaImgInput,
      LubnaDobInput,
      LubnaEmailInput,
      LubnaTeleInput,
      LubnaExpertiseInput,
      LubnaSkillsInput,
      LubnaEduInput,
      LubnaMsgInput
    ];

    let LubnaHasEmpty = false;

    for (const input of LubnaInputs) {
      if (!input) {
        LubnaHasEmpty = true;
        break;
      }

      if (input.type === 'file') {
        if (!input.files || input.files.length === 0) {
          LubnaHasEmpty = true;
          break;
        }
      } else {
        if (!input.value || input.value.trim() === '') {
          LubnaHasEmpty = true;
          break;
        }
      }
    }

    if (LubnaHasEmpty) {
      showAlert('الرجاء تعبئة جميع الحقول في نموذج الانضمام.', 'تنبيه');
      return;
    }

    const LubnaName = LubnaNameInput.value.trim();
    if (/^[0-9]/.test(LubnaName)) {
      showAlert('حقل الاسم لا يمكن أن يبدأ برقم.', 'تنبيه');
      LubnaNameInput.focus();
      return;
    }

    const LubnaFile = LubnaImgInput.files[0];
    if (!LubnaFile || !LubnaFile.type.startsWith('image/')) {
      showAlert('حقل الصورة يجب أن يحتوي على ملف صورة فقط.', 'تنبيه');
      LubnaImgInput.value = '';
      LubnaImgInput.focus();
      return;
    }

    const LubnaDobValue = LubnaDobInput.value;
    if (LubnaDobValue) {
      const LubnaDobDate = new Date(LubnaDobValue);
      const LubnaMaxDob = new Date('2008-12-31');
      if (LubnaDobDate > LubnaMaxDob) {
        showAlert('تاريخ الميلاد يجب ألا يكون بعد عام 2008.', 'تنبيه');
        LubnaDobInput.focus();
        return;
      }
    }

    showAlert('تم استلام طلب الانضمام بنجاح، شكرًا لك يا ' + LubnaName + '!', 'نجاح');
    LubnaForm.reset();
  });
}

    /* =============================================== Lubna & Remas End =============================================== */




