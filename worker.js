export default {
  async fetch(request, env, ctx) {
    // Handle frontend request
    if (request.method === 'GET') {
      return new Response(HTML, {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
        },
      });
    }

    // Handle file upload
    if (request.method === 'POST') {
      try {
        const formData = await request.formData();
        const file = formData.get('file');
        
        if (!file) {
          return new Response('No file uploaded', { status: 400 });
        }

        // Call Cloudflare's toMarkdown API
        const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/ai/tomarkdown`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.CF_API_TOKEN}`,
          },
          body: (() => {
            const formData = new FormData();
            formData.append('files', file);
            return formData;
          })(),
        });

        const result = await response.json();
        
        if (!result.success) {
          throw new Error('Conversion failed');
        }

        // Return the markdown content for download
        const markdown = result.result[0].data;
        return new Response(markdown, {
          headers: {
            'Content-Type': 'text/markdown',
            'Content-Disposition': `attachment; filename="${file.name.replace(/\.[^/.]+$/, '')}.md"`,
          },
        });

      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }

    return new Response('Method not allowed', { status: 405 });
  }
};

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF to Markdown Converter</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            margin-bottom: 30px;
        }
        .upload-area {
            border: 2px dashed #ccc;
            border-radius: 8px;
            padding: 40px;
            text-align: center;
            cursor: pointer;
            margin-bottom: 20px;
            transition: all 0.3s ease;
        }
        .upload-area:hover {
            border-color: #666;
            background: #f9f9f9;
        }
        .upload-area.dragover {
            border-color: #2196F3;
            background: #E3F2FD;
        }
        #file-input {
            display: none;
        }
        .status {
            margin-top: 20px;
            text-align: center;
            color: #666;
        }
        .loading {
            display: none;
            margin: 20px auto;
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>PDF to Markdown Converter</h1>
        <form id="upload-form">
            <div class="upload-area" id="drop-area">
                <p>Drag & drop your PDF file here or click to select</p>
                <input type="file" id="file-input" accept=".pdf" name="file">
            </div>
            <div class="loading" id="loading"></div>
            <div class="status" id="status"></div>
        </form>
    </div>

    <script>
        const form = document.getElementById('upload-form');
        const dropArea = document.getElementById('drop-area');
        const fileInput = document.getElementById('file-input');
        const loading = document.getElementById('loading');
        const status = document.getElementById('status');

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Highlight drop zone when file is dragged over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });

        // Handle dropped files
        dropArea.addEventListener('drop', handleDrop, false);
        
        // Handle click upload
        dropArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFiles);

        function preventDefaults (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight(e) {
            dropArea.classList.add('dragover');
        }

        function unhighlight(e) {
            dropArea.classList.remove('dragover');
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            handleFiles({ target: { files } });
        }

        function handleFiles(e) {
            const file = e.target.files[0];
            if (file) {
                uploadFile(file);
            }
        }

        async function uploadFile(file) {
            const formData = new FormData();
            formData.append('file', file);

            loading.style.display = 'block';
            status.textContent = 'Converting...';

            try {
                const response = await fetch('/', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Conversion failed');
                }

                // Create a download link for the markdown file
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name.replace(/\.[^/.]+$/, '') + '.md';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                status.textContent = 'Conversion successful! File downloaded.';
            } catch (error) {
                status.textContent = 'Error: ' + error.message;
            } finally {
                loading.style.display = 'none';
            }
        }
    </script>
</body>
</html>`; 