import axios from 'axios';

const compileCode = async (req, res) => {
  const { language, version = '*', code } = req.body;

  try {
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
      language,
      version,
      files: [
        {
          name: `main.${getExtension(language)}`,
          content: code,
        },
      ],
    });

    const output = response.data.run.stdout || response.data.run.stderr || 'No output';
    res.json({ output });
  } catch (err) {
    console.error('Compilation error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Compilation failed' });
  }
};

// Helper function to determine file extension based on language
const getExtension = (language) => {
  const map = {
    python: 'py',
    javascript: 'js',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    csharp: 'cs',
    ruby: 'rb',
    go: 'go',
    rust: 'rs',
    php: 'php',
    swift: 'swift',
    typescript: 'ts',
    kotlin: 'kt',
    // Add more if needed
  };

  return map[language.toLowerCase()] || 'txt';
};

export { compileCode };
