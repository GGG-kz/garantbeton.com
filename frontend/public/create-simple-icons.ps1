# Создание простых PWA иконок через PowerShell

# Создаем простой HTML файл для генерации иконок
$html = @"
<!DOCTYPE html>
<html>
<head>
    <title>Создание иконок</title>
</head>
<body>
    <canvas id="canvas192" width="192" height="192" style="border:1px solid #ccc;"></canvas>
    <canvas id="canvas512" width="512" height="512" style="border:1px solid #ccc;"></canvas>
    
    <script>
        function createIcon(canvas, size) {
            const ctx = canvas.getContext('2d');
            
            // Фон - темно-серый
            ctx.fillStyle = '#1f2937';
            ctx.fillRect(0, 0, size, size);
            
            // Белый круг
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(size/2, size/2, size*0.35, 0, 2 * Math.PI);
            ctx.fill();
            
            // Серый круг внутри
            ctx.fillStyle = '#6b7280';
            ctx.beginPath();
            ctx.arc(size/2, size/2, size*0.25, 0, 2 * Math.PI);
            ctx.fill();
            
            // Текст "Б"
            ctx.fillStyle = '#1f2937';
            ctx.font = `bold ${size*0.4}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Б', size/2, size/2);
        }
        
        function downloadCanvas(canvas, filename) {
            const link = document.createElement('a');
            link.download = filename;
            link.href = canvas.toDataURL();
            link.click();
        }
        
        // Создаем иконки
        createIcon(document.getElementById('canvas192'), 192);
        createIcon(document.getElementById('canvas512'), 512);
        
        console.log('Иконки созданы! Нажмите на canvas для скачивания.');
        
        // Добавляем обработчики клика
        document.getElementById('canvas192').onclick = () => downloadCanvas(document.getElementById('canvas192'), 'pwa-192x192.png');
        document.getElementById('canvas512').onclick = () => downloadCanvas(document.getElementById('canvas512'), 'pwa-512x512.png');
    </script>
</body>
</html>
"@

# Сохраняем HTML файл
$html | Out-File -FilePath "create-icons.html" -Encoding UTF8

Write-Host "✅ HTML файл для создания иконок создан: create-icons.html"
Write-Host "Откройте этот файл в браузере и скачайте иконки"
