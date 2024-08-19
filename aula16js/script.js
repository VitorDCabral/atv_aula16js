const API_BASE_URL = "https://api.apilayer.com/exchangerates_data/latest";
const API_KEY = "3b41d8da9048a8db3f8d64cc2640f4a8"; // Substitua pela sua chave de API

// Função para obter a taxa de câmbio entre duas moedas
async function obterCotacaoMoeda(baseCurrency, targetCurrency) {
    try {
        const response = await fetch(`${API_BASE_URL}?base=${baseCurrency}`, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro na requisição: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        
        if (!data.rates) {
            throw new Error("A resposta da API não contém a propriedade 'rates'.");
        }
        
        const rate = data.rates[targetCurrency];
        
        if (!rate) {
            throw new Error(`Moeda alvo '${targetCurrency}' não encontrada na resposta.`);
        }
        
        return {
            baseCurrency: baseCurrency,
            targetCurrency: targetCurrency,
            rate: rate
        };
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

// Função para converter um valor de uma moeda base para uma moeda destino
async function exemploConversaoMoeda(baseCurrency, targetCurrency, value) {
    const cotacao = await obterCotacaoMoeda(baseCurrency, targetCurrency);
    
    if (!cotacao) {
        return null;
    }
    
    const rate = cotacao.rate;
    const convertedValue = value * rate;
    
    return {
        baseCurrency: baseCurrency,
        targetCurrency: targetCurrency,
        originalValue: value,
        convertedValue: convertedValue,
        rate: rate
    };
}

// Manipulador de eventos do formulário
document.getElementById('currency-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const baseCurrency = document.getElementById('baseCurrency').value.toUpperCase().trim();
    const targetCurrency = document.getElementById('targetCurrency').value.toUpperCase().trim();
    const amount = parseFloat(document.getElementById('amount').value);

    if (isNaN(amount) || amount <= 0) {
        alert("Por favor, insira um valor válido.");
        return;
    }

    const result = await exemploConversaoMoeda(baseCurrency, targetCurrency, amount);

    const resultDiv = document.getElementById('result');
    
    if (result) {
        resultDiv.innerHTML = `
            <h2>Resultado da Conversão</h2>
            <p><strong>Moeda Base:</strong> ${result.baseCurrency}</p>
            <p><strong>Moeda Destino:</strong> ${result.targetCurrency}</p>
            <p><strong>Valor Original:</strong> ${result.originalValue} ${result.baseCurrency}</p>
            <p><strong>Valor Convertido:</strong> ${result.convertedValue.toFixed(2)} ${result.targetCurrency}</p>
            <p><strong>Taxa de Câmbio:</strong> ${result.rate}</p>
        `;
    } else {
        resultDiv.innerHTML = "<p>Ocorreu um erro ao obter a taxa de câmbio.</p>";
    }
});
