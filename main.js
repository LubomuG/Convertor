$(document).ready(function() {
    
    var exchangeRates = {};
    var darkMode = false;
    
    var savedTheme = localStorage.getItem('currencyTheme');
    if (savedTheme === 'dark') {
        darkMode = true;
        document.body.classList.add('dark-theme');
        $('#themeToggle i').removeClass('fa-moon').addClass('fa-sun');
        $('#themeToggle span').text('Світла тема');
    }
    
    $('#themeToggle').click(function() {
        darkMode = !darkMode;
        if (darkMode) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('currencyTheme', 'dark');
            $('#themeToggle i').removeClass('fa-moon').addClass('fa-sun');
            $('#themeToggle span').text('Світла тема');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('currencyTheme', 'light');
            $('#themeToggle i').removeClass('fa-sun').addClass('fa-moon');
            $('#themeToggle span').text('Темна тема');
        }
    });
    
    function loadCurrencies() {
        $('#currencyFrom').html('<option value="">Завантаження...</option>');
        $('#currencyTo').html('<option value="">Завантаження...</option>');
        
        $.ajax({
            url: 'https://open.er-api.com/v6/latest/USD',
            method: 'GET',
            success: function(data) {
                if (data && data.rates) {
                    exchangeRates = data.rates;
                    
                    var currencyList = Object.keys(data.rates);
                    
                    var htmlFrom = '';
                    var htmlTo = '';
                    
                    for (var i = 0; i < currencyList.length; i++) {
                        var currency = currencyList[i];
                        htmlFrom += '<option value="' + currency + '">' + currency + '</option>';
                        htmlTo += '<option value="' + currency + '">' + currency + '</option>';
                    }
                    
                    $('#currencyFrom').html(htmlFrom);
                    $('#currencyTo').html(htmlTo);
                    
                    var savedFrom = localStorage.getItem('savedFrom') || 'UAH';
                    var savedTo = localStorage.getItem('savedTo') || 'USD';
                    var savedAmount1 = localStorage.getItem('savedAmount1') || '';
                    var savedAmount2 = localStorage.getItem('savedAmount2') || '';
                    
                    $('#currencyFrom').val(savedFrom);
                    $('#currencyTo').val(savedTo);
                    $('#amount1').val(savedAmount1);
                    $('#amount2').val(savedAmount2);
                    
                    if (savedAmount1 && parseFloat(savedAmount1) > 0) {
                        setTimeout(convertCurrency, 100);
                    }
                }
            },
            error: function() {
                alert('Не вдалося завантажити курси валют');
            }
        });
    }
    
    function convertCurrency() {
        var amount1 = $('#amount1').val();
        var fromCurrency = $('#currencyFrom').val();
        var toCurrency = $('#currencyTo').val();
        
        if (!amount1 || amount1 <= 0 || !fromCurrency || !toCurrency) {
            return;
        }
        
        if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
            alert('Помилка: не вдалося отримати курси');
            return;
        }
        
        var amountNumber = parseFloat(amount1);
        var rateFrom = exchangeRates[fromCurrency];
        var rateTo = exchangeRates[toCurrency];
        
        var amountInUSD = amountNumber / rateFrom;
        var result = amountInUSD * rateTo;
        
        $('#amount2').val(result.toFixed(2));
        
        saveToStorage();
    }
    
    function convertCurrencyReverse() {
        var amount2 = $('#amount2').val();
        var fromCurrency = $('#currencyTo').val();
        var toCurrency = $('#currencyFrom').val();
        
        if (!amount2 || amount2 <= 0 || !fromCurrency || !toCurrency) {
            return;
        }
        
        if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
            alert('Помилка: не вдалося отримати курси');
            return;
        }
        
        var amountNumber = parseFloat(amount2);
        var rateFrom = exchangeRates[fromCurrency];
        var rateTo = exchangeRates[toCurrency];
        
        var amountInUSD = amountNumber / rateFrom;
        var result = amountInUSD * rateTo;
        
        $('#amount1').val(result.toFixed(2));
        
        saveToStorage();
    }
    
    function saveToStorage() {
        var dataToSave = {
            from: $('#currencyFrom').val(),
            to: $('#currencyTo').val(),
            amount1: $('#amount1').val(),
            amount2: $('#amount2').val()
        };
        
        localStorage.setItem('savedFrom', dataToSave.from);
        localStorage.setItem('savedTo', dataToSave.to);
        localStorage.setItem('savedAmount1', dataToSave.amount1);
        localStorage.setItem('savedAmount2', dataToSave.amount2);
    }
    
    $('#convertBtn').click(function() {
        convertCurrency();
    });
    
    $('#swapBtn').click(function() {
        var fromValue = $('#currencyFrom').val();
        var toValue = $('#currencyTo').val();
        var amount1Value = $('#amount1').val();
        var amount2Value = $('#amount2').val();
        
        $('#currencyFrom').val(toValue);
        $('#currencyTo').val(fromValue);
        $('#amount1').val(amount2Value);
        $('#amount2').val(amount1Value);
        
        saveToStorage();
    });
    
    $('#reverseBtn').click(function() {
        var fromValue = $('#currencyFrom').val();
        var toValue = $('#currencyTo').val();
        
        $('#currencyFrom').val(toValue);
        $('#currencyTo').val(fromValue);
        
        if ($('#amount1').val()) {
            convertCurrency();
        }
        
        saveToStorage();
    });
    
    $('#clearAllBtn').click(function() {
        $('#amount1').val('');
        $('#amount2').val('');
        saveToStorage();
    });
    
    $('.action-btn[data-multiplier]').click(function() {
        var multiplier = $(this).data('multiplier');
        var currentValue = $('#amount1').val();
        
        if (!currentValue) {
            currentValue = 0;
        }
        
        var newValue = parseFloat(currentValue) + multiplier;
        $('#amount1').val(newValue);
        
        convertCurrency();
        saveToStorage();
    });
    
    $('#currencyFrom').change(function() {
        convertCurrency();
        saveToStorage();
    });
    
    $('#currencyTo').change(function() {
        convertCurrency();
        saveToStorage();
    });
    
    $('#amount1').on('input', function() {
        if ($(this).val()) {
            $('#amount2').val('');
            convertCurrency();
            saveToStorage();
        }
    });
    
    $('#amount2').on('input', function() {
        if ($(this).val()) {
            $('#amount1').val('');
            convertCurrencyReverse();
            saveToStorage();
        }
    });
    
    $('.clear-btn').click(function() {
        var targetId = $(this).data('target');
        $('#' + targetId).val('').focus();
        saveToStorage();
    });
    
    $('.number-btn').click(function() {
        var targetId = $(this).data('target');
        var changeValue = $(this).data('change');
        var inputElement = $('#' + targetId);
        var currentValue = inputElement.val();
        
        if (!currentValue) {
            currentValue = 0;
        }
        
        var newValue = parseFloat(currentValue) + parseFloat(changeValue);
        
        if (newValue < 0) {
            newValue = 0;
        }
        
        inputElement.val(newValue.toFixed(2));
        
        if (targetId === 'amount1') {
            $('#amount2').val('');
            convertCurrency();
        } else if (targetId === 'amount2') {
            $('#amount1').val('');
            convertCurrencyReverse();
        }
        
        saveToStorage();
    });
    
    $('.currency-input').keydown(function(e) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            var currentValue = $(this).val();
            if (!currentValue) {
                currentValue = 0;
            }
            var newValue = parseFloat(currentValue) + 0.1;
            $(this).val(newValue.toFixed(2));
            $(this).trigger('input');
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            var currentValue = $(this).val();
            if (!currentValue) {
                currentValue = 0;
            }
            var newValue = parseFloat(currentValue) - 0.1;
            if (newValue < 0) {
                newValue = 0;
            }
            $(this).val(newValue.toFixed(2));
            $(this).trigger('input');
        }
    });
    
    loadCurrencies();
    
    setInterval(function() {
        loadCurrencies();
    }, 300000);
    
    function showMessage(text) {
        var messageDiv = $('<div class="message-box"></div>');
        messageDiv.text(text);
        $('body').append(messageDiv);
        
        setTimeout(function() {
            messageDiv.remove();
        }, 3000);
        
        $('<style>').text('.message-box { position: fixed; top: 20px; right: 20px; background: var(--accent); color: white; padding: 10px 20px; border-radius: 5px; z-index: 1000; }').appendTo('head');
    }
    
    function validateInput(value) {
        if (isNaN(value)) {
            return false;
        }
        if (value < 0) {
            return false;
        }
        return true;
    }
    
    function checkInternetConnection() {
        if (!navigator.onLine) {
            showMessage('Перевірте підключення до інтернету');
        }
    }
    
    window.addEventListener('online', function() {
        loadCurrencies();
    });
    
    window.addEventListener('offline', function() {
        showMessage('Втрачено підключення до інтернету');
    });
    
    checkInternetConnection();
    
    function formatNumber(num) {
        return parseFloat(num).toFixed(2);
    }
    
    function roundNumber(num) {
        return Math.round(num * 100) / 100;
    }
    
    function getCurrentDate() {
        var now = new Date();
        var day = now.getDate();
        var month = now.getMonth() + 1;
        var year = now.getFullYear();
        return day + '.' + month + '.' + year;
    }
    
    function getCurrentTime() {
        var now = new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        return hours + ':' + (minutes < 10 ? '0' + minutes : minutes);
    }
    
    function addHistory(amount, from, to, result) {
        var historyItem = {
            date: getCurrentDate(),
            time: getCurrentTime(),
            amount: amount,
            from: from,
            to: to,
            result: result
        };
        
        var history = localStorage.getItem('conversionHistory');
        if (!history) {
            history = [];
        } else {
            history = JSON.parse(history);
        }
        
        history.unshift(historyItem);
        
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        localStorage.setItem('conversionHistory', JSON.stringify(history));
    }
    
    $('#convertBtn').click(function() {
        var amount = $('#amount1').val();
        var from = $('#currencyFrom').val();
        var to = $('#currencyTo').val();
        var result = $('#amount2').val();
        
        if (amount && result) {
            addHistory(amount, from, to, result);
        }
    });
    
    function showHistory() {
        var history = localStorage.getItem('conversionHistory');
        if (history) {
            history = JSON.parse(history);
            console.log('Історія конвертацій:', history);
        }
    }
    
    function clearHistory() {
        localStorage.removeItem('conversionHistory');
    }
    
    function resetAll() {
        localStorage.clear();
        location.reload();
    }
    
    function helpInfo() {
        var helpText = "Інструкція:\n1. Виберіть валюту з якої конвертуєте\n2. Виберіть валюту в яку конвертуєте\n3. Введіть суму\n4. Натисніть 'Конвертувати'\n5. Використовуйте стрілочки для зміни суми";
        alert(helpText);
    }
    
    $(document).keydown(function(e) {
        if (e.key === 'F1') {
            e.preventDefault();
            helpInfo();
        }
        if (e.key === 'Escape') {
            $('#amount1').val('');
            $('#amount2').val('');
        }
    });
    
    function animateButton(buttonId) {
        $(buttonId).css('transform', 'scale(0.95)');
        setTimeout(function() {
            $(buttonId).css('transform', 'scale(1)');
        }, 100);
    }
    
    $('button').click(function() {
        animateButton('#' + $(this).attr('id'));
    });
    
    function playClickSound() {
        try {
            var audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
            audio.play();
        } catch(e) {
        }
    }
    
    function changeBackground() {
        var colors = ['#f8f9fa', '#f0f8ff', '#fffaf0', '#f5f5f5'];
        var randomColor = colors[Math.floor(Math.random() * colors.length)];
        $('body').css('background-color', randomColor);
        
        setTimeout(function() {
            $('body').css('background-color', '');
        }, 1000);
    }
    
    function countConversions() {
        var count = localStorage.getItem('conversionCount') || 0;
        count = parseInt(count) + 1;
        localStorage.setItem('conversionCount', count);
        return count;
    }
    
    $('#convertBtn').click(function() {
        var count = countConversions();
        if (count % 10 === 0) {
            showMessage('Ви зробили вже ' + count + ' конвертацій!');
        }
    });
    
    function checkMobile() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            $('body').addClass('mobile-device');
        }
    }
    
    checkMobile();
    
    function setupPrint() {
        window.print();
    }
    
    function setupShare() {
        if (navigator.share) {
            navigator.share({
                title: 'Конвертер валют',
                text: 'Я використав конвертер валют!',
                url: window.location.href
            });
        } else {
            alert('Поділитись посиланням: ' + window.location.href);
        }
    }
    
    function setupFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    function setupCopyResult() {
        var result = $('#amount2').val();
        if (result) {
            navigator.clipboard.writeText(result);
            showMessage('Результат скопійовано: ' + result);
        }
    }
    
    function setupPasteAmount() {
        navigator.clipboard.readText().then(function(text) {
            if (!isNaN(text) && text.trim() !== '') {
                $('#amount1').val(text);
                convertCurrency();
            }
        });
    }
    
    function setupRandomAmount() {
        var randomAmount = Math.floor(Math.random() * 10000) + 1;
        $('#amount1').val(randomAmount);
        convertCurrency();
    }
    
    function setupDonate() {
        alert('Дякуємо за використання конвертера!\nЯкщо хочете підтримати розробника:\n\nКартка: 5375 4141 1234 5678\nPayPal: developer@example.com');
    }
    
    function setupFeedback() {
        var feedback = prompt('Будь ласка, залишіть свій відгук про конвертер:');
        if (feedback) {
            localStorage.setItem('userFeedback', feedback);
            showMessage('Дякуємо за ваш відгук!');
        }
    }
    
    function setupLanguage() {
        var lang = confirm('Бажаєте перейти на англійську версію?') ? 'en' : 'uk';
        localStorage.setItem('preferredLanguage', lang);
        showMessage('Мову змінено. Перезавантажте сторінку.');
    }
    
    function setupCalculator() {
        var calc = prompt('Введіть математичний вираз (наприклад: 100+50*2):');
        if (calc) {
            try {
                var result = eval(calc);
                $('#amount1').val(result);
                convertCurrency();
            } catch(e) {
                alert('Помилка у виразі');
            }
        }
    }
    
    function setupNightModeAuto() {
        var hour = new Date().getHours();
        if (hour >= 20 || hour < 6) {
            if (!darkMode) {
                $('#themeToggle').click();
            }
        }
    }
    
    setupNightModeAuto();
    
    function setupCurrencyChart() {
        showMessage('Графік курсів в розробці...');
    }
    
    function setupRateApp() {
        var rating = prompt('Оцініть додаток від 1 до 5 зірочок:');
        if (rating >= 1 && rating <= 5) {
            localStorage.setItem('appRating', rating);
            showMessage('Дякуємо за оцінку ' + rating + ' ⭐');
        }
    }
    
    function setupTutorial() {
        var steps = [
            'Крок 1: Виберіть валюту "Віддаю"',
            'Крок 2: Виберіть валюту "Отримую"',
            'Крок 3: Введіть суму',
            'Крок 4: Натисніть "Конвертувати"'
        ];
        
        var currentStep = 0;
        
        function nextStep() {
            if (currentStep < steps.length) {
                alert(steps[currentStep]);
                currentStep++;
                setTimeout(nextStep, 1000);
            }
        }
        
        nextStep();
    }
    
    function setupExportData() {
        var data = {
            from: $('#currencyFrom').val(),
            to: $('#currencyTo').val(),
            amount: $('#amount1').val(),
            result: $('#amount2').val(),
            date: new Date().toLocaleString()
        };
        
        var dataStr = JSON.stringify(data, null, 2);
        var blob = new Blob([dataStr], {type: 'application/json'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'conversion_data.json';
        a.click();
    }
    
    function setupImportData() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = function(e) {
            var file = e.target.files[0];
            var reader = new FileReader();
            
            reader.onload = function(event) {
                try {
                    var data = JSON.parse(event.target.result);
                    if (data.amount && data.from && data.to) {
                        $('#currencyFrom').val(data.from);
                        $('#currencyTo').val(data.to);
                        $('#amount1').val(data.amount);
                        convertCurrency();
                    }
                } catch(error) {
                    alert('Помилка завантаження файлу');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    function setupBackup() {
        var allData = {
            settings: {
                theme: darkMode ? 'dark' : 'light',
                from: $('#currencyFrom').val(),
                to: $('#currencyTo').val()
            },
            history: localStorage.getItem('conversionHistory')
        };
        
        localStorage.setItem('backupData', JSON.stringify(allData));
        showMessage('Резервну копію створено');
    }
    
    function setupRestore() {
        var backup = localStorage.getItem('backupData');
        if (backup) {
            if (confirm('Відновити налаштування з резервної копії?')) {
                var data = JSON.parse(backup);
                if (data.settings.theme === 'dark' && !darkMode) {
                    $('#themeToggle').click();
                }
                $('#currencyFrom').val(data.settings.from);
                $('#currencyTo').val(data.settings.to);
                showMessage('Налаштування відновлено');
            }
        } else {
            showMessage('Резервна копія не знайдена');
        }
    }
    
    console.log('Конвертер валют завантажено успішно!');
    console.log('Версія: 1.0.0');
    console.log('Автор: Любомир');
    console.log('Дата: ' + getCurrentDate());
    
});
