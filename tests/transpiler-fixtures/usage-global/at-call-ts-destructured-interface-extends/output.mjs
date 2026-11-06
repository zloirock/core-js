import "core-js/modules/es.string.at";
interface Base {
  title: string;
}
interface Article extends Base {
  views: number;
}
declare function getArticle(): Article;
const {
  title
}: Article = getArticle();
title.at(0);