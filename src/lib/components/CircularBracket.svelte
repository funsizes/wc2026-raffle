<script lang="ts">
  import { matchesToFeed } from "$lib/bracket/adapter";
  import { buildModel, type RoundLabels } from "$lib/bracket/model";
  import { renderBracket, type BracketRenderOutput } from "$lib/bracket/render";
  import type { BracketFlag, BracketTip } from "$lib/bracket/types";
  import { t } from "$lib/i18n/locale.svelte";
  import type { Match } from "$lib/types";
  import { tick, untrack } from "svelte";
  import Flag from "./Flag.svelte";
  import "./CircularBracket.css";

  interface Props {
    matches?: Match[] | null;
    active?: boolean;
  }

  let { matches = null, active = false }: Props = $props();

  const CAP_TIP_DELAY = 600;

  const TOOLTIP_MARGIN = 8;

  let stageEl = $state<HTMLDivElement | null>(null);
  let tooltipEl = $state<HTMLDivElement | null>(null);
  let prevWinners = $state<Record<number, string>>({});

  let tooltip = $state<{
    visible: boolean;
    below: boolean;
    left: number;
    top: number;
    shift: number;
    tip: BracketTip | null;
  }>({ visible: false, below: false, left: 0, top: 0, shift: 0, tip: null });

  let capTipTimer: ReturnType<typeof setTimeout> | null = null;
  let capTipEv: PointerEvent | null = null;

  const roundLabels = $derived<RoundLabels>({
    1: t("stage.LAST_32"),
    2: t("stage.LAST_16"),
    3: t("stage.QUARTER_FINALS"),
    4: t("stage.SEMI_FINALS"),
    5: t("stage.FINAL"),
    champion: t("bracket.champion"),
    tbd: t("bracket.tbd"),
  });

  const feed = $derived(matchesToFeed(matches));
  const model = $derived(buildModel(feed));

  let rendered = $state<BracketRenderOutput>({
    svgHtml: "",
    flags: [],
    newWinners: {},
  });

  $effect(() => {
    model;
    roundLabels;
    const result = renderBracket(
      model,
      untrack(() => prevWinners),
      roundLabels,
    );
    rendered = result;
    prevWinners = result.newWinners;
  });

  function flagStyle(flag: BracketFlag): string {
    const left = ((flag.x / 1000) * 100).toFixed(3);
    const top = ((flag.y / 1000) * 100).toFixed(3);
    return `left:${left}%;top:${top}%`;
  }

  function cancelCapTip() {
    if (capTipTimer) clearTimeout(capTipTimer);
    capTipTimer = null;
  }

  function hideTip() {
    cancelCapTip();
    tooltip = { ...tooltip, visible: false };
  }

  function readTip(el: HTMLElement): BracketTip | null {
    const d = el.dataset;
    if (!d.teams) return null;
    return {
      round: d.round ?? "",
      teams: d.teams,
      score: d.score ?? "",
      when: d.when ?? "",
      status: (d.status as BracketTip["status"]) ?? "",
      venue: d.venue ?? "",
    };
  }

  function clampTooltipPosition(anchorX: number) {
    if (!tooltipEl) return;

    const half = tooltipEl.offsetWidth / 2;
    const clampedLeft = Math.min(
      Math.max(anchorX, TOOLTIP_MARGIN + half),
      window.innerWidth - TOOLTIP_MARGIN - half,
    );

    tooltip = {
      ...tooltip,
      left: clampedLeft,
      shift: anchorX - clampedLeft,
    };
  }

  async function showTip(el: HTMLElement, ev: PointerEvent | MouseEvent) {
    const tip = readTip(el);
    if (!tip) return;

    const isCap = el.classList.contains("cap");
    const r = isCap ? null : el.getBoundingClientRect();
    const anchorX = isCap ? ev.clientX : r!.left + r!.width / 2;
    const top = isCap ? ev.clientY : r!.top;
    const bottom = isCap ? ev.clientY : r!.bottom;
    const flip = top < 90;

    tooltip = {
      visible: true,
      below: flip,
      left: anchorX,
      top: flip ? bottom : top,
      shift: 0,
      tip,
    };

    await tick();
    clampTooltipPosition(anchorX);
  }

  function onStagePointerOver(ev: PointerEvent) {
    const el = (ev.target as HTMLElement).closest(
      ".bracket-flag,.bracket-cap",
    ) as HTMLElement | null;
    if (!el || ev.pointerType === "touch") return;

    if (el.classList.contains("bracket-cap")) {
      cancelCapTip();
      capTipEv = ev;
      capTipTimer = setTimeout(() => {
        capTipTimer = null;
        if (capTipEv) showTip(el, capTipEv);
      }, CAP_TIP_DELAY);
    } else {
      showTip(el, ev);
    }
  }

  function onStagePointerOut(ev: PointerEvent) {
    if (
      (ev.target as HTMLElement).closest(".bracket-flag,.bracket-cap") &&
      ev.pointerType !== "touch"
    ) {
      hideTip();
    }
  }

  function onStagePointerMove(ev: PointerEvent) {
    if (ev.pointerType === "touch") return;
    const el = (ev.target as HTMLElement).closest(
      ".bracket-cap",
    ) as HTMLElement | null;
    if (!el) return;
    capTipEv = ev;
    if (tooltip.visible) showTip(el, ev);
  }

  function onStageClick(ev: MouseEvent) {
    const el = (ev.target as HTMLElement).closest(
      ".bracket-flag,.bracket-cap",
    ) as HTMLElement | null;
    if (!el) return;
    ev.stopPropagation();
    cancelCapTip();

    const tip = readTip(el);

    if (!tip) return;

    showTip(el, ev);
  }

  $effect(() => {
    if (!active || !stageEl) return;

    let stageDPR = window.devicePixelRatio || 1;

    const onResize = () => {
      const dpr = window.devicePixelRatio || 1;
      if (dpr !== stageDPR) {
        stageDPR = dpr;
        return;
      }
      if (tooltip.visible && tooltipEl) {
        clampTooltipPosition(tooltip.left + tooltip.shift);
      }
    };

    const onDocClick = () => {
      hideTip();
    };
    const onScroll = () => hideTip();

    window.addEventListener("resize", onResize);
    document.addEventListener("click", onDocClick);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("click", onDocClick);
      window.removeEventListener("scroll", onScroll);
    };
  });
</script>

<div class="circular-bracket-root">
  <div class="circular-bracket">
    {#if matches === null}
      <p class="circular-bracket-loading">{t("bracket.loading")}</p>
    {:else if active}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <div
        class="circular-bracket-stage"
        bind:this={stageEl}
        onpointerover={onStagePointerOver}
        onpointerout={onStagePointerOut}
        onpointermove={onStagePointerMove}
        onclick={onStageClick}
        role="presentation"
      >
        {@html rendered.svgHtml}

        {#each rendered.flags as flag (flag.team + flag.x + flag.y + flag.cls)}
          <span
            class="bracket-flag {flag.cls}"
            style={flagStyle(flag)}
            data-round={flag.tip.round}
            data-teams={flag.tip.teams}
            data-score={flag.tip.score}
            data-when={flag.tip.when}
            data-status={flag.tip.status}
            data-venue={flag.tip.venue}
            data-ground={flag.ground}
          >
            <Flag entry={{ team: flag.team, api: flag.team }} icons />
          </span>
        {/each}
      </div>
    {/if}

    <div class="circular-bracket-footer">
      <p>
        {t("bracket.credit")}:
        <a href="https://www.instagram.com/p/DaJPx6Hkfi1" target="_blank">
          {t("bracket.creditBy")} Emilio Sansolini
        </a>
      </p>
    </div>
  </div>

  {#if tooltip.visible && tooltip.tip}
    <div
      class="circular-bracket-tooltip"
      class:on={tooltip.visible}
      class:below={tooltip.below}
      bind:this={tooltipEl}
      style:left="{tooltip.left}px"
      style:top="{tooltip.top}px"
      style:--tt-shift="{tooltip.shift}px"
      role="tooltip"
    >
      {#if tooltip.tip.round}
        <div class="tt-round">{tooltip.tip.round}</div>
      {/if}
      <div class="tt-teams">{tooltip.tip.teams}</div>
      {#if tooltip.tip.status === "live"}
        <div class="tt-score live">
          <span class="live-dot" aria-hidden="true"></span>
          {#if tooltip.tip.score}
            {tooltip.tip.score}
          {:else}
            {t("matchStatus.live")}
          {/if}
        </div>
        {#if tooltip.tip.when}
          <div class="tt-soon">{tooltip.tip.when}</div>
        {/if}
      {:else if tooltip.tip.score}
        <div class="tt-score">{tooltip.tip.score}</div>
      {:else}
        <div class="tt-score pending">
          {tooltip.tip.when || t("bracket.notPlayed")}
        </div>
        {#if tooltip.tip.status === "soon"}
          <div class="tt-soon">{t("bracket.startingSoon")}</div>
        {/if}
      {/if}
      {#if tooltip.tip.venue}
        <div class="tt-venue">{tooltip.tip.venue}</div>
      {/if}
    </div>
  {/if}
</div>
