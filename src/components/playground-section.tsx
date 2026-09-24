import { useTranslations } from 'next-intl';

const ITEM_ICONS = ['⌨', '🔖', '🐛', '↪'];

export function PlaygroundSection() {
  const t = useTranslations('playground');

  const items = [
    { key: '1', title: t('item1Title'), desc: t('item1Desc'), icon: ITEM_ICONS[0] },
    { key: '2', title: t('item2Title'), desc: t('item2Desc'), icon: ITEM_ICONS[1] },
    { key: '3', title: t('item3Title'), desc: t('item3Desc'), icon: ITEM_ICONS[2] },
    { key: '4', title: t('item4Title'), desc: t('item4Desc'), icon: ITEM_ICONS[3] },
  ];

  return (
    <section className="sec" id="playground" aria-labelledby="playground-title">
      <div className="sec__head">
        <span className="sec__num">06</span>
        <div>
          <h2 id="playground-title" className="sec__title">{t('title')}</h2>
          <p className="sec__intro">{t('intro')}</p>
        </div>
      </div>

      <ul className="pg__list" role="list">
        {items.map((item) => (
          <li key={item.key} className="pg__item">
            <div className="pg__item-icon" aria-hidden="true">{item.icon}</div>
            <h3 className="pg__item-title">{item.title}</h3>
            <p className="pg__item-desc">{item.desc}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
