interface PrivacyPolicyDetail {
  label: string;
  value: string;
  href?: string;
}

interface PrivacyPolicySection {
  title: string;
  paragraphs?: readonly string[];
  items?: readonly string[];
  footer?: string;
  details?: readonly PrivacyPolicyDetail[];
}

interface PrivacyPolicyContent {
  title: string;
  introduction: readonly string[];
  sections: readonly PrivacyPolicySection[];
}

export const privacyPolicyContent = {
  ru: {
    title: 'Политика конфиденциальности',

    introduction: [
      'В настоящей Политике описывается, как компания SELBEUM FURNITURE AND LIGHTING LTD, далее — Оператор, получает, использует, хранит и защищает персональные данные посетителей сайта Altioria.ru.',
      'Отправляя заявку через форму на сайте, пользователь подтверждает, что ознакомился с настоящей Политикой и согласен на обработку предоставленных данных на изложенных ниже условиях.',
    ],

    sections: [
      {
        title: '1. Какие сведения мы получаем',

        paragraphs: [
          'При заполнении формы обратной связи или отправке запроса через Altioria.ru пользователь может предоставить следующие сведения:',
        ],

        items: [
          'имя;',
          'номер телефона;',
          'адрес электронной почты;',
          'текст сообщения или запроса;',
          'другую информацию, которую пользователь решил сообщить добровольно.',
        ],

        footer:
          'Формы сайта не предназначены для сбора специальных категорий персональных данных.',
      },

      {
        title: '2. Для чего используются данные',

        paragraphs: [
          'Предоставленная информация может использоваться Оператором для следующих целей:',
        ],

        items: [
          'рассмотрение поступившего обращения и подготовка ответа;',
          'связь с пользователем по указанным контактным данным;',
          'предоставление информации о предметах Altioria, услугах, доступности и возможностях заказа;',
          'обсуждение сотрудничества, индивидуальных проектов и частных заказов;',
          'ведение внутреннего учёта поступивших обращений.',
        ],

        footer:
          'Данные не используются для целей, которые не связаны с первоначальной причиной их предоставления.',
      },

      {
        title: '3. Основание для обработки',

        paragraphs: [
          'Обработка осуществляется на основании согласия пользователя, выраженного при отправке формы на Altioria.ru. Отозвать согласие можно в любое время, направив обращение на info@altioria.design.',
        ],
      },

      {
        title: '4. Действия с персональными данными',

        paragraphs: [
          'В пределах, необходимых для обработки обращения, Оператор может выполнять следующие действия:',
        ],

        items: [
          'получение и запись данных;',
          'систематизация;',
          'хранение;',
          'уточнение и обновление;',
          'использование для обработки обращения;',
          'передача внутри команды Оператора ответственным сотрудникам;',
          'ограничение обработки;',
          'удаление;',
          'уничтожение.',
        ],

        footer:
          'Объём обработки ограничивается действиями, необходимыми для ответа пользователю и дальнейшего общения по его запросу.',
      },

      {
        title: '5. Срок хранения',

        paragraphs: [
          'Данные сохраняются на период, необходимый для рассмотрения обращения и достижения связанных с ним целей. Более продолжительное хранение допускается только тогда, когда этого требует или разрешает применимое законодательство.',
          'После достижения цели обработки либо после отзыва согласия сведения удаляются или обезличиваются, если закон не устанавливает иное.',
        ],
      },

      {
        title: '6. Передача другим лицам',

        paragraphs: [
          'Оператор не продаёт персональные данные и не передаёт их сторонним организациям для самостоятельной рекламы. Доступ к сведениям может предоставляться только при наличии необходимости:',
        ],

        items: [
          'сотрудникам и уполномоченным представителям, которые работают с обращениями;',
          'поставщикам технических, почтовых и инфраструктурных сервисов, обеспечивающих работу сайта и доставку сообщений;',
          'государственным органам, когда передача предусмотрена законом или производится по законному требованию.',
        ],

        footer:
          'Привлечённые исполнители вправе обрабатывать сведения только в пределах задач, определённых Оператором.',
      },

      {
        title: '7. Рекламные сообщения',

        paragraphs: [
          'Отправка формы обратной связи сама по себе не означает согласия на рекламную рассылку. Маркетинговые сообщения могут направляться только после получения отдельного согласия пользователя.',
          'Если такие рассылки появятся в будущем, пользователь сможет отказаться от них и отозвать своё согласие.',
        ],
      },

      {
        title: '8. Защита информации',

        paragraphs: [
          'Оператор применяет разумные организационные и технические меры для защиты сведений от утраты, изменения, неправомерного раскрытия, уничтожения и несанкционированного доступа.',
          'Работать с данными могут только лица, которым такой доступ требуется для рассмотрения обращений и общения с пользователями.',
        ],
      },

      {
        title: '9. Права пользователя',

        paragraphs: [
          'Пользователь вправе:',
        ],

        items: [
          'получить сведения об обработке своих персональных данных;',
          'потребовать исправления, ограничения обработки или удаления неполных, устаревших, неточных либо неправомерно обрабатываемых данных;',
          'отозвать ранее предоставленное согласие;',
          'обратиться к Оператору по любому вопросу, связанному с использованием своих данных.',
        ],

        footer:
          'Для реализации перечисленных прав напишите на info@altioria.design.',
      },

      {
        title: '10. Файлы cookie и данные браузера',

        paragraphs: [
          'Сайт может использовать технические cookie и локальное хранилище браузера для корректной работы интерфейса, сохранения выбранного языка и обеспечения необходимых функций.',
          'При появлении систем аналитики сведения об их использовании будут добавлены в настоящую Политику. Пользователь может ограничить хранение cookie в настройках браузера, однако отдельные функции сайта после этого могут работать неправильно.',
        ],
      },

      {
        title: '11. Изменение Политики',

        paragraphs: [
          'Оператор вправе обновлять настоящий документ при изменении сайта, используемых сервисов или требований законодательства.',
          'Действующая редакция всегда публикуется на Altioria.ru. Продолжение использования сайта после обновления означает ознакомление пользователя с новой версией.',
        ],
      },

      {
        title: '12. Сведения об Операторе',

        details: [
          {
            label: 'Оператор:',
            value: 'SELBEUM FURNITURE AND LIGHTING LTD',
          },
          {
            label: 'Электронная почта:',
            value: 'info@altioria.design',
            href: 'mailto:info@altioria.design',
          },
          {
            label: 'Сайт:',
            value: 'Altioria.ru',
            href: 'https://altioria.ru',
          },
        ],
      },
    ],
  },

  en: {
    title: 'Privacy policy',

    introduction: [
      'This document describes how SELBEUM FURNITURE AND LIGHTING LTD, referred to below as the Operator, receives, uses, retains and safeguards information submitted by visitors to Altioria.ru.',
      'When a visitor sends an enquiry through the website, they confirm that they have reviewed this document and agree to the described handling of their information.',
    ],

    sections: [
      {
        title: '1. Information received',

        paragraphs: [
          'A visitor who completes a contact or enquiry form may provide the Operator with:',
        ],

        items: [
          'their name;',
          'their telephone number;',
          'their email address;',
          'the contents of an enquiry or message;',
          'other details they decide to provide voluntarily.',
        ],

        footer:
          'The website forms are not intended to request sensitive or special categories of information.',
      },

      {
        title: '2. Why the information is used',

        paragraphs: [
          'Submitted information may be used to:',
        ],

        items: [
          'review an enquiry and prepare a response;',
          'contact the visitor through the details they supplied;',
          'share information about Altioria objects, services, availability and commissions;',
          'discuss cooperation, bespoke projects or private orders;',
          'keep an internal history of incoming enquiries.',
        ],

        footer:
          'Information will not be used for purposes unrelated to the reason for which it was originally supplied.',
      },

      {
        title: '3. Grounds for processing',

        paragraphs: [
          'Processing is based on the consent given when a visitor submits a form through Altioria.ru. Consent may be withdrawn at any time by writing to info@altioria.design.',
        ],
      },

      {
        title: '4. Operations involving information',

        paragraphs: [
          'To deal with an enquiry, the Operator may perform the following operations:',
        ],

        items: [
          'receive and record information;',
          'organise it;',
          'retain it;',
          'correct or update it;',
          'use it to handle the enquiry;',
          'share it internally with responsible team members;',
          'restrict its use;',
          'erase it;',
          'destroy it.',
        ],

        footer:
          'Processing is limited to what is reasonably required to answer the visitor and continue communication concerning the enquiry.',
      },

      {
        title: '5. Retention',

        paragraphs: [
          'Information is retained only for the period reasonably needed to handle the enquiry and fulfil the related purposes. It may be kept for longer where applicable law requires or permits this.',
          'Once the relevant purpose has been fulfilled, or consent has been withdrawn, the information will be erased or anonymised unless it must be retained by law.',
        ],
      },

      {
        title: '6. Recipients and disclosures',

        paragraphs: [
          'The Operator does not sell personal information or provide it to another organisation for that organisation’s own advertising. Information may be disclosed where necessary:',
        ],

        items: [
          'to employees and authorised representatives responsible for enquiries;',
          'to infrastructure, email and technical service providers involved in operating the website and delivering messages;',
          'to competent authorities where disclosure is required by law or by a valid official request.',
        ],

        footer:
          'Any engaged service provider may handle information only within the tasks assigned by the Operator.',
      },

      {
        title: '7. Promotional messages',

        paragraphs: [
          'Submitting an enquiry does not automatically subscribe the visitor to advertising. Promotional communications may be sent only after separate permission has been obtained.',
          'If promotional communications are introduced, recipients will be able to unsubscribe and withdraw that permission.',
        ],
      },

      {
        title: '8. Security',

        paragraphs: [
          'Reasonable organisational and technical safeguards are used to reduce the risk of unauthorised access, alteration, loss, disclosure or destruction.',
          'Access is limited to people who require the information to handle enquiries and communicate with visitors.',
        ],
      },

      {
        title: '9. Your rights',

        paragraphs: [
          'A visitor may:',
        ],

        items: [
          'ask what information concerning them is being processed;',
          'request correction, restriction or deletion of incomplete, outdated, inaccurate or unlawfully processed information;',
          'withdraw their consent;',
          'contact the Operator with questions concerning their information.',
        ],

        footer:
          'Requests concerning these rights may be sent to info@altioria.design.',
      },

      {
        title: '10. Browser storage and cookies',

        paragraphs: [
          'The website may use essential cookies or browser storage to provide its functions and remember preferences such as the selected language.',
          'If analytics services are introduced, this document will be updated accordingly. Visitors may restrict cookies through their browser, although this can prevent certain parts of the website from working correctly.',
        ],
      },

      {
        title: '11. Policy updates',

        paragraphs: [
          'This document may be revised when the website, connected services or applicable requirements change.',
          'The current version will remain available through Altioria.ru. Continued use of the website following an update confirms that the visitor has had an opportunity to review the revised version.',
        ],
      },

      {
        title: '12. Operator details',

        details: [
          {
            label: 'Operator:',
            value: 'SELBEUM FURNITURE AND LIGHTING LTD',
          },
          {
            label: 'Email:',
            value: 'info@altioria.design',
            href: 'mailto:info@altioria.design',
          },
          {
            label: 'Website:',
            value: 'Altioria.ru',
            href: 'https://altioria.ru',
          },
        ],
      },
    ],
  },
} satisfies Record<
  'ru' | 'en',
  PrivacyPolicyContent
>;