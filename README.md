# NFT
- Написать контракты NFT стандартов ERC-721, ERC-1155 совместимые с opensea. Можно наследовать паттерн у openzeppelin.
- Написать контракт NFT
- Написать полноценные тесты к контракту
- Написать скрипт деплоя
- Задеплоить в тестовую сеть
- Написать таск на mint
- Верифицировать контракт
- Загрузить какой либо файл на ipfs
- Вставить в контракт NFT ссылку на ipfs

### Требования
- Все предусмотренные стандартами ERC-721, ERC-1155 функции
- Все данные NFT должны отображаться на opensea



# Маркетплэйс
Написать контракт маркетплейса, который должен включать в себя функцию создания NFT, а также функционал аукциона.
- Написать контракт маркетплейса NFT
- Написать полноценные тесты к контракту
- Написать скрипт деплоя
- Задеплоить в тестовую сеть
- Написать таск на mint
- Верифицировать контракт

### Требования
- Функция createItem() - создание нового предмета, обращается к контракту NFT и вызывает функцию mint.
- Функция mint(), доступ к которой должен иметь только контракт маркетплейса
- Функция listItem() - выставка на продажу предмета.
- Функция buyItem() - покупка предмета.
- Функция cancel() - отмена продажи выставленного предмета
- Функция listItemOnAuction() - выставка предмета на продажу в аукционе.
- Функция makeBid() - сделать ставку на предмет аукциона с определенным id.
- Функция finishAuction() - завершить аукцион и отправить НФТ победителю
- Функция cancelAuction() - отменить аукцион

Аукцион длится 3 дня с момента старта аукциона. В течении этого срока аукцион не может быть отменен.
В случае если по истечению срока набирается более двух ставок аукцион считается состоявшимся и создатель
аукциона его завершает (НФТ переходит к последнему биддеру и токены создателю аукциона).
В противном случае токены возвращаются последнему биддеру, а НФТ остается у создателя.


# Etherscan
[NFT721](https://rinkeby.etherscan.io/address/0x49085904BcfBEd93145AC9bd3F16Ff82682af53d)

[NFT1155](https://rinkeby.etherscan.io/address/0x5eB7077cF70f7d58Cc3BB79f2ee65dd38697F0a9)

[MARKETPLACE](https://rinkeby.etherscan.io/address/0x97C8D90351284e4b77b329E082e32efCaeB9Ea81)
