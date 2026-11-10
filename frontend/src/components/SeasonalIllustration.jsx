function SpringScene() {
  return (
    <>
      <defs>
        <linearGradient id="spring-hill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e9b9c9" stopOpacity=".5" />
          <stop offset="1" stopColor="#f8dce2" stopOpacity=".16" />
        </linearGradient>
        <radialGradient id="spring-sun">
          <stop stopColor="#fff5df" stopOpacity=".88" />
          <stop offset="1" stopColor="#f7cbd4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="1120" cy="320" r="290" fill="url(#spring-sun)" />
      <path d="M0 690Q240 570 470 670T930 640T1440 660V900H0Z" fill="url(#spring-hill)" />
      <g className="scenery-tree spring-tree" transform="translate(1135 870)">
        <path d="M-18 25Q-8-130 1-300M-5-130Q-150-250-235-390M0-205Q110-330 220-405M-125-220Q-120-330-92-400M105-300Q85-405 52-462" fill="none" stroke="#98756c" strokeOpacity=".58" strokeWidth="20" strokeLinecap="round" />
        <path d="M-15-145Q-164-240-245-365M3-212Q150-310 238-393M-118-244Q-64-327-45-412M100-310Q61-385 23-434" fill="none" stroke="#aa7d79" strokeOpacity=".58" strokeWidth="8" strokeLinecap="round" />
        {[
          [-245, -380, 65], [-176, -421, 76], [-104, -392, 69], [-43, -449, 74],
          [29, -432, 70], [96, -458, 79], [168, -418, 75], [235, -397, 61],
          [-202, -318, 61], [-111, -328, 67], [-15, -350, 73], [78, -354, 72], [177, -340, 66],
        ].map(([x, y, r], index) => (
          <g className="scenery-bloom" style={{ "--bloom-delay": `${index * -0.42}s` }} key={`${x}-${y}`}>
            <circle cx={x} cy={y} r={r} fill={index % 2 ? "#eeb6c9" : "#f2c4cd"} fillOpacity=".42" />
            <circle cx={x - r * .27} cy={y - r * .1} r={r * .26} fill="#fff1ed" fillOpacity=".6" />
            <circle cx={x + r * .2} cy={y + r * .18} r={r * .21} fill="#f3d9b2" fillOpacity=".68" />
          </g>
        ))}
      </g>
      <g fill="#e6a3b8" fillOpacity=".6">
        <path className="scenery-flower" d="M250 745c-28-34 2-55 18-21 7-38 44-27 24 7 38-11 45 26 6 29 22 32-9 49-28 15-17 36-52 15-27-13-37 5-40-32-3-30Z" />
        <path className="scenery-flower" style={{ "--flower-delay": "-2s" }} d="M850 730c-19-24 2-38 13-15 5-27 31-19 17 5 27-8 32 19 4 21 16 23-6 35-20 11-12 26-37 11-19-9-26 4-28-23-2-22Z" />
      </g>
    </>
  );
}

function SummerScene() {
  return (
    <>
      <defs>
        <radialGradient id="summer-sun">
          <stop stopColor="#fff3c2" stopOpacity=".86" />
          <stop offset=".48" stopColor="#f4d988" stopOpacity=".34" />
          <stop offset="1" stopColor="#f4d988" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="summer-hill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#a4bd84" stopOpacity=".55" />
          <stop offset="1" stopColor="#d7dfb4" stopOpacity=".2" />
        </linearGradient>
      </defs>
      <circle cx="1095" cy="270" r="340" fill="url(#summer-sun)" />
      <g className="scenery-sun" transform="translate(1095 270)" fill="none" stroke="#e8bd61" strokeOpacity=".3" strokeWidth="5">
        {Array.from({ length: 12 }, (_, i) => <path key={i} transform={`rotate(${i * 30})`} d="M0-150V-222" />)}
      </g>
      <circle cx="1095" cy="270" r="67" fill="#f2d785" fillOpacity=".46" />
      <g className="scenery-cloud" fill="#fffdf0" fillOpacity=".35">
        <path d="M690 270c0-25 20-45 45-45 11-32 58-38 76-5 32-3 49 34 27 57H716c-15 0-26-2-26-7Z" />
        <path d="M1030 420c0-18 15-33 33-33 8-24 42-28 56-4 23-2 36 25 20 42h-91c-11 0-18-2-18-5Z" />
      </g>
      <path d="M0 700Q230 610 460 682T920 670T1440 640V900H0Z" fill="url(#summer-hill)" />
      <g className="scenery-tree summer-tree" transform="translate(310 730)">
        <path d="M0 165Q12 35 5-86M4 35Q-72-45-116-104M10 5Q83-55 126-102" fill="none" stroke="#6c8157" strokeOpacity=".5" strokeWidth="17" strokeLinecap="round" />
        <circle cx="-108" cy="-123" r="72" fill="#7fa36d" fillOpacity=".34" />
        <circle cx="-26" cy="-177" r="96" fill="#8eae72" fillOpacity=".38" />
        <circle cx="74" cy="-154" r="90" fill="#a2b878" fillOpacity=".35" />
        <circle cx="133" cy="-91" r="62" fill="#8aaa6e" fillOpacity=".33" />
      </g>
      <g className="scenery-grass" stroke="#78915c" strokeOpacity=".36" strokeWidth="4" strokeLinecap="round">
        {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${650 + i * 36} 870q${(i % 2 ? 18 : -16)}-48 ${i % 2 ? 9 : -8}-88`} />)}
      </g>
    </>
  );
}

function AutumnScene() {
  return (
    <>
      <defs>
        <radialGradient id="autumn-sun">
          <stop stopColor="#ffe4aa" stopOpacity=".8" />
          <stop offset="1" stopColor="#e7a35a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="autumn-hill" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#c48654" stopOpacity=".48" />
          <stop offset="1" stopColor="#ead0aa" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <circle cx="1125" cy="315" r="320" fill="url(#autumn-sun)" />
      <path d="M0 704Q260 596 520 682T1010 656T1440 662V900H0Z" fill="url(#autumn-hill)" />
      <g className="scenery-tree autumn-tree" transform="translate(1110 875)">
        <path d="M0 20Q-5-150 0-310M0-150Q-122-250-207-335M0-190Q114-284 196-374M-102-235Q-88-328-73-378M105-282Q78-366 50-424" fill="none" stroke="#765c49" strokeOpacity=".56" strokeWidth="22" strokeLinecap="round" />
        <path d="M-15-151Q-120-240-213-325M3-196Q112-276 206-365M-98-240Q-36-312-20-390M100-287Q61-351 33-410" fill="none" stroke="#80634b" strokeOpacity=".48" strokeWidth="8" strokeLinecap="round" />
        {[
          [-203, -340, 66, "#c77c36"], [-144, -397, 76, "#d99545"], [-82, -381, 70, "#b96539"],
          [-24, -436, 76, "#d8a44e"], [44, -419, 81, "#c87939"], [112, -441, 77, "#e0aa51"],
          [176, -392, 72, "#ad6039"], [218, -349, 58, "#d18b3f"], [-144, -302, 65, "#dfaa55"],
          [-63, -330, 69, "#c66d3a"], [28, -349, 75, "#d28b3d"], [112, -339, 70, "#b9663c"],
        ].map(([x, y, r, color], index) => (
          <circle className="scenery-leaf-cluster" style={{ "--leaf-delay": `${index * -0.6}s` }} key={`${x}-${y}`} cx={x} cy={y} r={r} fill={color} fillOpacity=".38" />
        ))}
      </g>
    </>
  );
}

function WinterScene() {
  return (
    <>
      <defs>
        <linearGradient id="winter-ridge-far" x1="0" y1="0" x2=".2" y2="1">
          <stop stopColor="#8caec8" stopOpacity=".38" />
          <stop offset="1" stopColor="#a9c5d9" stopOpacity=".2" />
        </linearGradient>
        <linearGradient id="winter-ridge-mid" x1="0" y1="0" x2=".15" y2="1">
          <stop stopColor="#6689a7" stopOpacity=".56" />
          <stop offset="1" stopColor="#92aec4" stopOpacity=".38" />
        </linearGradient>
        <linearGradient id="winter-snow-slope" x1="0" y1="0" x2=".15" y2="1">
          <stop stopColor="#edf6fb" stopOpacity=".78" />
          <stop offset="1" stopColor="#b5ccdc" stopOpacity=".52" />
        </linearGradient>
        <radialGradient id="winter-morning-light">
          <stop stopColor="#fff6e8" stopOpacity=".5" />
          <stop offset=".45" stopColor="#d7e9f4" stopOpacity=".23" />
          <stop offset="1" stopColor="#8eb2ce" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="winter-mist" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#eaf3f8" stopOpacity="0" />
          <stop offset=".52" stopColor="#eaf3f8" stopOpacity=".32" />
          <stop offset="1" stopColor="#d6e5ef" stopOpacity="0" />
        </linearGradient>
        <filter id="winter-mist-blur" x="-20%" y="-100%" width="140%" height="300%">
          <feGaussianBlur stdDeviation="24" />
        </filter>
        <linearGradient id="winter-pine-fill" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#42647f" />
          <stop offset=".5" stopColor="#587b94" />
          <stop offset="1" stopColor="#385b77" />
        </linearGradient>
        <linearGradient id="winter-pine-fill-far" x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#5f8098" />
          <stop offset="1" stopColor="#4a6f8a" />
        </linearGradient>
      </defs>
      <circle cx="1110" cy="265" r="280" fill="url(#winter-morning-light)" />

      <path d="M-25 684C112 664 190 621 291 627C407 634 465 590 566 588C669 586 726 628 827 633C950 639 1016 604 1115 604C1223 604 1327 628 1465 584V920H-25Z" fill="url(#winter-ridge-far)" />
      <path d="M-25 754C85 727 180 682 275 685C375 688 439 719 535 705C637 691 697 627 792 628C893 630 939 691 1041 699C1154 708 1238 662 1465 638V920H-25Z" fill="url(#winter-ridge-mid)" />
      <path d="M-25 751C88 727 182 686 275 689C377 692 441 724 538 710C638 696 700 637 792 638C894 640 942 701 1043 709C1155 718 1242 673 1465 648V920H-25Z" fill="url(#winter-snow-slope)" />
      <path d="M276 689C377 692 441 724 538 710C638 696 700 637 792 638C894 640 942 701 1043 709" fill="none" stroke="#f7fbfe" strokeOpacity=".62" strokeWidth="4" />
      <path d="M-25 790C111 761 229 744 341 757C453 770 525 810 658 795C781 781 845 734 971 741C1113 750 1197 790 1323 772C1373 765 1422 748 1465 743V920H-25Z" fill="#9db8cb" fillOpacity=".35" />
      <path d="M122 684C181 662 228 643 290 643M590 673C663 653 708 615 785 616M1071 680C1180 683 1257 647 1370 643" fill="none" stroke="#f5faff" strokeOpacity=".46" strokeWidth="3" />

      <g className="scenery-pine winter-pine winter-pine-distant" transform="translate(1135 786) scale(.5)" fill="url(#winter-pine-fill-far)">
        <path d="M0-390C-6-310-1-213-5-128C-9-56-1 5 0 70L10 70C8 2 15-65 14-132C13-222 19-307 11-390Z" />
        <path d="M2-358C-13-326-40-302-61-278C-39-284-21-293-3-309C-23-270-55-242-89-214C-58-218-31-230-7-250C-40-202-83-172-125-142C-85-145-48-161-9-188C-53-136-101-106-148-72C-105-74-59-94-5-128C-51-72-111-35-172 3C-121 2-65-17 1-59C-47-5-108 34-181 73C-115 73-58 52 6 13C5-113 12-235 2-358Z" />
        <path d="M-57-277C-40-283-20-300-4-320M-83-212C-59-219-29-237-7-258M-119-140C-88-148-48-170-8-196M-141-70C-105-79-55-107-5-136M-162 5C-121-5-61-35 0-68" fill="none" stroke="#edf6fb" strokeOpacity=".52" strokeWidth="7" strokeLinecap="round" />
      </g>

      <g className="scenery-pine winter-pine" transform="translate(1296 855) scale(.66)" fill="url(#winter-pine-fill)">
        <path d="M0-410C-7-324-1-232-5-145C-8-66-1 5 0 80L12 80C10 2 16-71 15-150C14-242 19-325 11-410Z" />
        <path d="M1-390C-14-352-42-325-69-293C-43-300-22-315-2-337C-27-288-65-251-107-218C-71-224-38-242-5-271C-47-211-98-170-150-135C-107-138-59-162-6-202C-61-134-121-91-181-50C-128-55-69-84-4-132C-62-61-134-13-209 33C-147 30-78 3 2-54C-58 29-134 83-222 133C-149 132-74 102 7 47C5-111 15-256 1-390Z" />
        <path d="M-64-292C-41-302-20-321-3-345M-100-217C-69-229-36-250-5-278M-140-134C-103-149-55-176-6-209M-171-48C-128-63-68-96-4-139M-197 34C-148 20-76-12 1-62" fill="none" stroke="#eaf4fa" strokeOpacity=".58" strokeWidth="9" strokeLinecap="round" />
      </g>

      <g className="scenery-cloud winter-cloud" fill="#f3f8fc" fillOpacity=".35">
        <path d="M741 302C741 282 757 266 777 266C785 243 817 239 831 260C855 259 868 284 855 302Z" />
        <path d="M1036 366C1036 349 1050 336 1067 336C1075 316 1101 313 1113 331C1133 329 1144 351 1132 366Z" />
      </g>

      <g fill="none" stroke="#edf5fa" strokeLinecap="round">
        <path d="M-20 720C180 687 299 710 453 740C620 772 783 748 924 720C1107 684 1271 710 1460 679" strokeWidth="42" strokeOpacity=".22" filter="url(#winter-mist-blur)" />
        <path d="M-20 816C176 786 327 798 493 827C674 858 829 826 988 805C1165 782 1316 810 1460 785" strokeWidth="34" strokeOpacity=".18" filter="url(#winter-mist-blur)" />
      </g>
      <path d="M0 733C184 705 313 728 457 753C625 782 781 759 925 732C1105 698 1274 721 1440 695V900H0Z" fill="url(#winter-mist)" />
    </>
  );
}

export default function SeasonalIllustration({ season }) {
  return (
    <svg
      className={`seasonal-illustration scene-${season}`}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      {season === "spring" && <SpringScene />}
      {season === "summer" && <SummerScene />}
      {season === "autumn" && <AutumnScene />}
      {season === "winter" && <WinterScene />}
    </svg>
  );
}
