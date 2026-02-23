import { useEffect, useRef } from 'react';

const Cursor = () => {
  const curRef  = useRef(null);
  const ringRef = useRef(null);
  const mx = useRef(0);
  const my = useRef(0);
  const rx = useRef(0);
  const ry = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const onMove = (e) => {
      mx.current = e.clientX;
      my.current = e.clientY;
      if (curRef.current) {
        curRef.current.style.transform = `translate(${mx.current - 4}px, ${my.current - 4}px)`;
      }
    };

    const animRing = () => {
      rx.current += (mx.current - rx.current) * 0.12;
      ry.current += (my.current - ry.current) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx.current - 18}px, ${ry.current - 18}px)`;
      }
      rafRef.current = requestAnimationFrame(animRing);
    };

    document.addEventListener('mousemove', onMove);
    rafRef.current = requestAnimationFrame(animRing);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div className="cursor" ref={curRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  );
};

export default Cursor;
