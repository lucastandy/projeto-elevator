class Elevator {

    // Método construtor. O principal método dentro de uma classe.
    constructor() {
        // Pegando a classe "elevator"
        this.$elevator = $('.elevator');
        this.floorQtd = 3;
        this.isMovement = false;
        this.queue = [];
        //this.initCamera();
        // Iniciando os eventos do botão
        this.initElevents();
    }

    // Iniciando a câmera
    initCamera() {

        navigator.mediaDevices.getUserMedia({
            video: true
        }).then(stream => {
            let video = this.$elevator.find('.camera')[0];

            video.srcObject = stream;
        }).catch(err => {
            console.error(err);
        });

    }

    // Evento para adicionar ações nos botões dos andares
    initElevents() {
        // Selecionando cada botão que tem a classe .btn
        $('.buttons .btn').on('click', e => {

            // o e.target vai mostrar em qual botão nós clicamos
            let btn = e.target;

            // Adicionando um efeito ao selecionar um botão
            $(btn).addClass('floor-selected');

            // Selecionando o andar que o usuário escolheu, ou seja, o botão selecionando
            let floor = $(btn).data('floor');

            // Indo para o andar selecionado
            this.goToFloor(floor);
        });
    }

    // Método para abrir as portas do elevador
    openDoor() {
        return new Promise((resolve, reject) => {
            if (this.isDoorsOpen()) {

                this.transitionEnd(() => {
                    resolve();
                });

            } else {
                this.$elevator.find('.door').addClass('open');
                this.transitionEnd(() => {
                    resolve();
                });
            }
        });

    }

    // Método para fechar as portas do elevador
    closeDoor() {

        return new Promise((resolve, reject) => {
            if (this.isDoorsOpen()) {

                this.$elevator.find('.door').removeClass('open');

                setTimeout(() => {
                    resolve();
                }, 1500);


            } else {
                resolve();

            }
        });

    }

    // Método que verifica se as portas estão abertas
    isDoorsOpen() {

        // Pegando a classe door
        let doors = this.$elevator.find('.door');

        // Verificando se a classe door possui o seletor 'open'
        return (doors.hasClass('open'));
    }

    // Função para finalizar uma transição
    transitionEnd(callback) {
        this.$elevator.on('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', () => {
            callback();
        });
    }

    goToFloor(number) {

        // Verificando se o elevador está em movimento
        if (!this.isMovement) {

            // Começou o movimento
            this.isMovement = true;

            this.closeDoor().then(() => {

                new Promise((resolve, reject) => {

                    let currentFloor = this.$elevator.data('floor');

                    // Verificando se o número selecionado é o mesmo do andar atual
                    
                    if (number !== currentFloor) {

                        this.removeFloorClasses();

                        let diff = number - currentFloor;

                        let time = diff * 2;

                        this.$elevator.addClass(`floor${number}`);

                        this.$elevator.data('floor', number);

                        this.$elevator.css('-webkit-transition-duration', `${time}s`);

                        this.transitionEnd(() => {
                            resolve();
                        });
                    }else{
                        resolve();
                    }

                }).then(() => {

                    // Recebendo o novo número do andar antes de abrir as portas
                    this.setDisplay(number);

                    // Abrindo as portas do elevador
                    this.openDoor().then(() => {
                        // Removendo o efeito no botão do andar
                        $(`.buttons .button${number}`).removeClass('floor-selected');

                        this.isMovement = false;

                        // A função "setTimeout()" executa uma função em um deternimado tempo. Neste caso, as portas do elevador serão fechadas em dentro de 3 segundos
                        setTimeout(() => {
                            this.closeDoor();
                        }, 3000);

                        setTimeout(() => {
                            if (this.queue.length) {
                                // Adicionando mais um andar na variável "newFlor" e ao mesmo tempo tirando o elemento do array
                                let newFloor = this.queue.shift();
                                // Indo para o novo andar
                                this.goToFloor(newFloor);
                            }
                        }, 2000);
                    });
                });
            });
        } else {
            // Se o elevador estiver em movimento, vamos adicionar os demais andares selecionados em uma fila
            this.queue.push(number);
        }
    }

    // Método para mudar o display do elevador
    setDisplay(floor) {
        this.$elevator.find('.display').text(floor);
    }

    removeFloorClasses() {
        for (let i = 1; i <= this.floorQtd; i++) {
            this.$elevator.removeClass(`floor${i}`);
        }
    }
}