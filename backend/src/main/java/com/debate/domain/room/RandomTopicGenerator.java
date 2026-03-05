package com.debate.domain.room;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class RandomTopicGenerator {

    private static final List<String> TOPICS = List.of(
            "인공지능이 인간의 일자리를 대체해야 한다",
            "사형제도는 폐지되어야 한다",
            "대학 입학시험은 폐지되어야 한다",
            "소셜 미디어는 사회에 해롭다",
            "채식주의는 모든 사람이 실천해야 한다",
            "원격 근무는 사무실 근무보다 생산적이다",
            "암호화폐는 법정화폐를 대체할 것이다",
            "유전자 편집 기술은 인간에게 사용되어야 한다",
            "핵에너지는 탄소 중립의 해답이다",
            "스포츠에서 남녀 구분은 없애야 한다",
            "동물 실험은 금지되어야 한다",
            "전 국민 기본 소득은 도입되어야 한다",
            "인터넷은 인간관계를 더 단절시킨다",
            "학교 교복은 의무화되어야 한다",
            "예술 작품에 AI가 저작권을 가져야 한다",
            "자율주행차는 인간이 운전하는 것보다 안전하다",
            "소셜 미디어 알고리즘은 규제되어야 한다",
            "부유세는 경제적 불평등 해소에 효과적이다",
            "게임은 폭력성을 조장한다",
            "환경 보호를 위해 경제 성장을 제한해야 한다"
    );

    public String generate() {
        return TOPICS.get(ThreadLocalRandom.current().nextInt(TOPICS.size()));
    }
}
