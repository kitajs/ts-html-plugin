import Html from '@kitajs/html';
import '@kitajs/html/register';

const date = new Date();
const safeString: string = 'safe';
const html = <div>Hello</div>;
const number = 1227;
const unsafeNumber = 1227;
const object = {};
const union = 1 as string | number;

function Component(props: Html.PropsWithChildren) {
  return <div>{props.children}</div>;
}

export const valid = (
  <>
    <div></div>
    <div>{date.getTime()}</div>
    <div safe>{date.toISOString()}</div>
    <div>{safeString}</div>
    <div safe>{html}</div>
    <div>{number}</div>
    <div safe>hello {html}</div>
    <div safe>{unsafeNumber}</div>
    <div safe>{union}</div>
    <div safe>
      {['a', 'b', 'c'].map((i) => (
        <>{i}</>
      ))}
    </div>
    <div>
      {['a', 'b', 'c'].map((i) => (
        <div safe>{i}</div>
      ))}
    </div>{' '}
    <div>
      {[1, 2, 3].map((i) => (
        <div>{i}</div>
      ))}
    </div>
    <div>
      {[1, 2, 3].map((i) => (
        <Component>{i}</Component>
      ))}
    </div>
    <div>
      {['a', 'b', 'c'].map((i) => (
        <Component>{Html.escapeHtml(i)}</Component>
      ))}
    </div>
    <div safe>{[1, 2, 3].map((i) => i)}</div>
    <div safe>{['a', 'b', 'c'].map((i) => i)}</div>
    <div>
      {'literal'}
      {1}
    </div>
    <div>{Html.escapeHtml(html)}</div>
    <div>{Html.escapeHtml(object)}</div>
    <div>
      <Component>{Html.escapeHtml(object)}</Component>
      asd
    </div>
  </>
);

export const invalid = (
  <div>
    <div>{html}</div>
    <div>{object}</div>
    <div>
      {['a', 'b', 'c'].map((i) => (
        <>{i}</>
      ))}
      {['a', 'b', 'c'].map((i) => (
        <div>{i}</div>
      ))}
    </div>
    <div>
      {[1, 2, 3].map((i) => (
        <>{i}</>
      ))}
    </div>
    <div>
      {['a', 'b', 'c'].map((i) => (
        <Component>{i}</Component>
      ))}
    </div>
    <div>{[1, 2, 3].map((i) => i)}</div>
    <div>{['a', 'b', 'c'].map((i) => i)}</div>
    <div>{[1, 2, 3].map((safeI) => safeI)}</div>
    <div>{['a', 'b', 'c'].map((safeI) => safeI)}</div>
    <div safe>
      <div>{number}</div>
    </div>
    <div safe>
      <Component>{Html.escapeHtml(object)}</Component>
      asd
    </div>
    <div safe>{Html.escapeHtml(object)}</div>
  </div>
);

export const unnecessary = (
  <>
    <div safe>
      {number} {safeString}
    </div>
    <div safe>{safeString}</div>
    <div safe> </div>
    <div safe></div>
  </>
);
