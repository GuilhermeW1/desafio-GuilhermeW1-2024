import { recintos } from './recintos.js';

const animais = new Map([
    ['LEAO', { especie: 'Leao', tamanho: 3, bioma: ['savana'], carnivoro: true }],
    ['LEOPARDO', { especie: 'Leopardo', tamanho: 2, bioma: ['savana'], carnivoro: true }],
    ['CROCODILO', { especie: 'Crocodilo', tamanho: 3, bioma: ['rio'], carnivoro:true }],
    ['MACACO', { especie: 'Macaco', tamanho: 1, bioma: ['savana', 'floresta'], carnivoro: false }],
    ['GAZELA', { especie: 'Gazela', tamanho: 2, bioma: ['savana'], carnivoro: false }],
    ['HIPOPOTAMO', { especie: 'Hipopotamo', tamanho: 4, bioma: ['savana', 'rio'], carnivoro: false }]
])

class RecintosZoo {

    analisaRecintos(animal, quantidade) {   
        if (quantidade <= 0) {
            return { erro: 'Quantidade inválida' };
        }

        animal = animal.toUpperCase();
        if (!this.validarAnimal(animal)) {
            return { erro: 'Animal inválido'};
        }
        
        const recintos = this.getRecintosDisponiveis(animal, quantidade);

        if (recintos.length == 0) {
            return { erro: 'Não há recinto viável'};
        }

        const recintosFormatados = recintos.map(rec => (
            `Recinto ${rec.numero} (espaço livre: ${rec.espacoLivre} total: ${rec.tamanhoTotal})`
        ));

        return { recintosViaveis: recintosFormatados };
    }       

    validarAnimal(animal) {
        if (!animais.has(animal)) {
            return false;
        }

        return true;
    }

    getRecintosDisponiveis(animal, quantidade) {
        const mapAnimal = animais.get(animal);
        const quantidadeTotal = mapAnimal.tamanho * quantidade;

        const recintosDisponiveis = recintos.reduce((acc, curr) => {
            //ve se ha algum bioma compativel
            if (!mapAnimal.bioma.find(bi => curr.bioma.find(currBi => currBi === bi))) {
                return acc;
            }

            //valida se os animais dentro de um bioma sao compativeis
            if (!this.getCompatibilidade(mapAnimal, curr, quantidade)) {
                return acc;
            }

            //valida se os animais cabem dentro desse bioma
            const espacoLivre = this.getEspacoLivre(curr.animaisExistentes, curr.tamanhoTotal, quantidadeTotal, animal);
            if (espacoLivre === -1) {
                return acc;
            }

            acc.push({
                ...curr,
                espacoLivre
            });
            return acc;
        }, [])

        return recintosDisponiveis;
    }

    getCompatibilidade(animal, recinto, quantidade) {
        for (const existAnimal of recinto.animaisExistentes) {
            const tempAnimal = animais.get(existAnimal.animal.toUpperCase());
            
            //verifica se as especies sao carnivoras
            if (tempAnimal.carnivoro !== animal.carnivoro) {
                return false;
            }

            //verifica se as especies carnivoras sao as mesmas
            if (animal.carnivoro && animal.especie !== tempAnimal.especie) {
                return false;
            }
            //um hipopotamo so pode ficar com outra especie se o bioma for savana E rio
            if (
                tempAnimal.especie === 'Hipopotamo' && animal.especie !== 'Hipopotamo' && 
                    (!recinto.bioma.includes('savana') || !recinto.bioma.includes('rio'))
                || animal.especie === 'Hipopotamo' && tempAnimal.especie !== 'Hipopotamo' &&
                    (!recinto.bioma.includes('savana') || !recinto.bioma.includes('rio'))
                ) {
                return false;
            }
        }

        //macacos nao podem ficar sozinhos em um recinto
        if (animal.especie === 'Macaco' && quantidade === 1 && recinto.animaisExistentes.length === 0) {
            return false;
        }

        return true;
    }

    getEspacoLivre(animaisExistentes, capacidadeMaxima, quantNovosAnimais, animal) {
        let contaEspacoOcupado = 0;

        //se houver uma especie diferente, um espaco a mais deve ser ocupado para cada uma delas
        let countEspeciesDiferentes = 0;
        const currAnimal = animais.get(animal.toUpperCase());

        for (const existAnimal of animaisExistentes) {
            const tempAnimal = animais.get(existAnimal.animal.toUpperCase());
            contaEspacoOcupado += tempAnimal.tamanho * existAnimal.quantidade;

            if (tempAnimal.especie !== currAnimal.especie) {
                countEspeciesDiferentes ++;
            }
        }
        const newEspacoTotal = contaEspacoOcupado + quantNovosAnimais + countEspeciesDiferentes;
        if (newEspacoTotal <= capacidadeMaxima) {
            return capacidadeMaxima - newEspacoTotal;
        }
        return -1;
    }
}

export { RecintosZoo as RecintosZoo };
