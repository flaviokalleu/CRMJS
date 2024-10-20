// src/routes/reportRoutes.js
const express = require('express');
const { Cliente } = require('../models');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();
const genAI = new GoogleGenerativeAI('AIzaSyCwVs-Zf-Re2Nmzw-VG0dNnsJs6as7oxXE'); // Insira a chave API diretamente
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

router.get('/relatorio', async (req, res) => {
    try {
        const clientes = await Cliente.findAll({
            attributes: ['estado_civil', 'profissao', 'naturalidade', 'valor_renda', 'status'],
        });

        if (!clientes.length) {
            return res.status(404).send('Nenhum cliente encontrado');
        }

        // Dados para os relatórios
        const totalClientes = clientes.length;
        const statusReport = {};
        const estadoCivilReport = {};
        const profissaoReport = {};
        const naturalidadeReport = {};
        let totalRenda = 0;
        const rendaArray = []; // Array para armazenar todas as rendas

        // Gera o relatório por status, estado civil, profissão e naturalidade
        for (const cliente of clientes) {
            // Agrupamento por status
            statusReport[cliente.status] = (statusReport[cliente.status] || 0) + 1;

            // Agrupamento por estado civil
            if (cliente.estado_civil) {
                estadoCivilReport[cliente.estado_civil] = (estadoCivilReport[cliente.estado_civil] || 0) + 1;
            }

            // Agrupamento por profissão
            if (cliente.profissao) {
                profissaoReport[cliente.profissao] = (profissaoReport[cliente.profissao] || 0) + 1;
            }

            // Agrupamento por naturalidade
            if (cliente.naturalidade) {
                naturalidadeReport[cliente.naturalidade] = (naturalidadeReport[cliente.naturalidade] || 0) + 1;
            }

            // Soma das rendas
            if (cliente.valor_renda) {
                totalRenda += parseFloat(cliente.valor_renda);
                rendaArray.push(parseFloat(cliente.valor_renda)); // Adiciona a renda ao array
            }
        }

        // Gera o HTML para o relatório
        let htmlContent = `
        <html>
        <head>
            <title>Relatório Geral de Clientes</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1, h2, h3 { color: blue; }
                p { font-size: 12px; text-align: justify; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid black; padding: 8px; text-align: center; }
            </style>
        </head>
        <body>
            <h1>Relatório Geral de Clientes</h1>
            <h2>Total de Clientes: ${totalClientes}</h2>
            <p>${await generateCEOComment('total de clientes', { totalClientes })}</p>
            
            <h2>Relatório por Status:</h2>
            <table>
                <tr><th>Status</th><th>Quantidade</th></tr>`;
        
        for (const [status, count] of Object.entries(statusReport)) {
            htmlContent += `<tr><td>${status}</td><td>${count}</td></tr>`;
        }

        htmlContent += `</table><p>${await generateCEOComment('status dos clientes', statusReport)}</p>`;

        // Adiciona seção para estado civil
        htmlContent += `<h2>Relatório por Estado Civil:</h2><table>
            <tr><th>Estado Civil</th><th>Quantidade</th></tr>`;
        
        for (const [estadoCivil, count] of Object.entries(estadoCivilReport)) {
            htmlContent += `<tr><td>${estadoCivil}</td><td>${count}</td></tr>`;
        }

        htmlContent += `</table><p>${await generateCEOComment('estado civil', estadoCivilReport)}</p>`;

        // Adiciona seção para profissão
        htmlContent += `<h2>Relatório por Profissão:</h2><table>
            <tr><th>Profissão</th><th>Quantidade</th></tr>`;
        
        for (const [profissao, count] of Object.entries(profissaoReport)) {
            htmlContent += `<tr><td>${profissao}</td><td>${count}</td></tr>`;
        }

        htmlContent += `</table><p>${await generateCEOComment('profissão', profissaoReport)}</p>`;

        // Adiciona seção para naturalidade
        htmlContent += `<h2>Relatório por Naturalidade:</h2><table>
            <tr><th>Naturalidade</th><th>Quantidade</th></tr>`;
        
        for (const [naturalidade, count] of Object.entries(naturalidadeReport)) {
            htmlContent += `<tr><td>${naturalidade}</td><td>${count}</td></tr>`;
        }

        htmlContent += `</table><p>${await generateCEOComment('naturalidade', naturalidadeReport)}</p>`;

        // Média de renda
        const mediaRenda = totalRenda / totalClientes;
        const mediaRendaFormatted = mediaRenda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        htmlContent += `<h2>Média de Renda dos Clientes: ${mediaRendaFormatted}</h2>`;
        htmlContent += `<p>${await generateCEOComment('média de renda', { mediaRenda, totalRenda, totalClientes })}</p>`;

        // Finaliza o HTML
        htmlContent += `</body></html>`;
        
        res.send(htmlContent); // Envia o HTML como resposta
    } catch (error) {
        console.error('Erro ao gerar o relatório:', error);
        res.status(500).send('Erro ao gerar o relatório');
    }
});

// Função para gerar comentários do CEO em português
async function generateCEOComment(sectionTitle, data) {
    const prompt = `Como CEO de uma imobiliária focada no programa 'Minha Casa, Minha Vida' no estado de Goiás, forneça insights estratégicos sobre como podemos melhorar as métricas relacionadas a ${sectionTitle}. Aqui estão os dados: ${JSON.stringify(data)}. Considere fatores como a demanda por habitação popular, as características demográficas dos nossos clientes, as políticas de financiamento e os desafios do mercado imobiliário local. Buscamos orientações que nos ajudem a aumentar as vendas e a satisfação do cliente, além de identificar novas oportunidades de negócios na região.`;
    const result = await model.generateContent(prompt);
    
    // Remove os asteriscos e formata o texto
    let formattedText = result.response.text().replace(/\*\*/g, ''); // Remove os asteriscos
    formattedText = formattedText.replace(/(?:\r\n|\r|\n)/g, '<br>'); // Substitui quebras de linha por <br> para HTML

    return formattedText;
}

module.exports = router;
